package io.guallet.android

import io.guallet.android.core.network.*
import io.guallet.android.features.accounts.data.KtorAccountsRepository
import io.guallet.android.features.accounts.domain.*
import io.ktor.client.engine.mock.*
import io.ktor.client.plugins.ServerResponseException
import io.ktor.http.*
import io.ktor.http.content.OutgoingContent
import java.math.BigDecimal
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.*
import org.junit.Assert.*
import org.junit.Test

class AccountsContractTest {
    private val origin = "https://api.example.test"
    private val fixture =
        """{"id":"account-1","name":"Everyday","currency":"GBP","type":"current-account","balance":{"amount":"1234.56","currency":"GBP"},"institutionId":null,"source":"manual","properties":{"details":{"accountNumber":"private"}}}"""

    @Test
    fun `accounts supports string decimals nullable institutions and unknown fields`() = runTest {
        val client =
            createApiClient(
                origin,
                PersistentCookies(MemoryCookieStore(), origin),
                MockEngine { request ->
                    assertEquals("/accounts", request.url.encodedPath)
                    assertEquals(HttpMethod.Get, request.method)
                    respond(
                        "[$fixture]",
                        headers = headersOf(HttpHeaders.ContentType, "application/json"),
                    )
                },
            )
        try {
            val account = KtorAccountsRepository(client).list().single()
            assertEquals(BigDecimal("1234.56"), account.balance?.amount)
            assertNull(account.institutionId)
            assertEquals(AccountType.Current, account.accountType)
        } finally {
            client.close()
        }
    }

    @Test
    fun `create and patch use exact numeric major units and distinct balance field names`() =
        runTest {
            val methods = mutableListOf<HttpMethod>()
            val client =
                createApiClient(
                    origin,
                    PersistentCookies(MemoryCookieStore(), origin),
                    MockEngine { request ->
                        methods.add(request.method)
                        val body =
                            Json.parseToJsonElement(
                                    (request.body as OutgoingContent.ByteArrayContent)
                                        .bytes()
                                        .decodeToString()
                                )
                                .jsonObject
                        val field =
                            if (request.method == HttpMethod.Post) "initial_balance" else "balance"
                        assertEquals(
                            "1234567890123456789.1234",
                            body[field]?.jsonPrimitive?.content,
                        )
                        assertFalse(body[field]!!.jsonPrimitive.isString)
                        assertEquals(
                            true,
                            body["create_balance_transaction"]?.jsonPrimitive?.boolean,
                        )
                        assertFalse(body.containsKey("properties"))
                        assertFalse(body.containsKey("institution_id"))
                        if (request.method == HttpMethod.Post) {
                            assertEquals("/accounts", request.url.encodedPath)
                            assertEquals("manual", body["source"]?.jsonPrimitive?.content)
                            assertFalse(body.containsKey("balance"))
                        } else {
                            assertEquals("/accounts/account-1", request.url.encodedPath)
                            assertFalse(body.containsKey("initial_balance"))
                            assertFalse(body.containsKey("source"))
                        }
                        respond(
                            fixture,
                            headers = headersOf(HttpHeaders.ContentType, "application/json"),
                        )
                    },
                )
            try {
                val repository = KtorAccountsRepository(client)
                val input =
                    AccountInput(
                        "Everyday",
                        "current-account",
                        "CLF",
                        BigDecimal("1234567890123456789.1234"),
                    )
                repository.create(input)
                repository.update("account-1", input)
                assertEquals(listOf(HttpMethod.Post, HttpMethod.Patch), methods)
            } finally {
                client.close()
            }
        }

    @Test
    fun `details current month transactions and deletion use typed nested resources`() = runTest {
        val paths = mutableListOf<String>()
        val methods = mutableListOf<HttpMethod>()
        val client =
            createApiClient(
                origin,
                PersistentCookies(MemoryCookieStore(), origin),
                MockEngine { request ->
                    paths.add(request.url.encodedPath)
                    methods.add(request.method)
                    val response =
                        if (request.url.encodedPath.endsWith("transactions"))
                            """[{"id":"txn-1","accountId":"account-1","description":"Coffee","amount":-3.25,"currency":"GBP","date":"2026-11-10T12:00:00Z","notes":null}]"""
                        else fixture
                    respond(
                        response,
                        headers = headersOf(HttpHeaders.ContentType, "application/json"),
                    )
                },
            )
        try {
            val repository = KtorAccountsRepository(client)
            repository.get("account-1")
            assertEquals(BigDecimal("-3.25"), repository.transactions("account-1").single().amount)
            repository.delete("account-1")
            assertEquals(
                listOf(
                    "/accounts/account-1",
                    "/accounts/account-1/transactions",
                    "/accounts/account-1",
                ),
                paths,
            )
            assertEquals(listOf(HttpMethod.Get, HttpMethod.Get, HttpMethod.Delete), methods)
        } finally {
            client.close()
        }
    }

    @Test
    fun `unknown account types and missing balance do not become fabricated zero balances`() {
        val account =
            apiJson.decodeFromString<Account>(
                """{"id":"1","name":"Future account","currency":"GBP","type":"new-type","balance":null}"""
            )
        assertEquals(AccountType.Unknown, account.accountType)
        assertNull(account.balance)
    }

    @Test
    fun `server failures propagate instead of returning empty accounts`() = runTest {
        val client =
            createApiClient(
                origin,
                PersistentCookies(MemoryCookieStore(), origin),
                MockEngine {
                    respond(
                        "{}",
                        HttpStatusCode.ServiceUnavailable,
                        headersOf(HttpHeaders.ContentType, "application/json"),
                    )
                },
            )
        try {
            try {
                KtorAccountsRepository(client).list()
                fail("Must fail")
            } catch (_: ServerResponseException) {
                /* expected */
            }
        } finally {
            client.close()
        }
    }
}
