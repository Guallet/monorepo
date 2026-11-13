package io.guallet.android

import io.guallet.android.core.network.PersistentCookies
import io.guallet.android.core.network.createApiClient
import io.guallet.android.core.security.CookieStore
import io.guallet.android.features.auth.data.BetterAuthRepository
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.client.plugins.ClientRequestException
import io.ktor.http.*
import io.ktor.http.content.OutgoingContent
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.*
import org.junit.Assert.*
import org.junit.Test

class MemoryCookieStore : CookieStore {
    var value: String? = null

    override fun read() = value

    override fun write(value: String) {
        this.value = value
    }
}

class AuthContractTest {
    private val origin = "https://api.example.test"
    private val user = """{"id":"user-1","name":"Alex","email":"alex@example.test"}"""

    @Test
    fun `sign in uses typed REST path and restores persisted secure session`() = runTest {
        val store = MemoryCookieStore()
        val cookies = PersistentCookies(store, origin)
        val client =
            createApiClient(
                origin,
                cookies,
                MockEngine { request ->
                    assertEquals("/auth/sign-in/email", request.url.encodedPath)
                    assertEquals(HttpMethod.Post, request.method)
                    assertEquals("guallet-android://", request.headers[HttpHeaders.Origin])
                    val body =
                        Json.parseToJsonElement(
                                (request.body as OutgoingContent.ByteArrayContent)
                                    .bytes()
                                    .decodeToString()
                            )
                            .jsonObject
                    assertEquals("alex@example.test", body["email"]?.jsonPrimitive?.content)
                    assertEquals("password", body["password"]?.jsonPrimitive?.content)
                    assertEquals(true, body["rememberMe"]?.jsonPrimitive?.boolean)
                    respond(
                        """{"user":$user,"token":"ignored"}""",
                        headers =
                            headersOf(
                                HttpHeaders.ContentType to listOf("application/json"),
                                HttpHeaders.SetCookie to
                                    listOf(
                                        "__Secure-better-auth.session_token=secret; Path=/; Secure; HttpOnly; Max-Age=604800"
                                    ),
                            ),
                    )
                },
            )
        assertEquals(
            "user-1",
            BetterAuthRepository(client, cookies).signIn("alex@example.test", "password").id,
        )
        client.close()
        val restored = PersistentCookies(store, origin)
        assertEquals("secret", restored.get(Url("$origin/auth/get-session")).single().value)
        assertTrue(restored.get(Url("https://other.example.test/auth")).isEmpty())
        assertTrue(restored.get(Url("http://api.example.test/auth")).isEmpty())
        val restoredClient =
            createApiClient(
                origin,
                restored,
                MockEngine { request ->
                    assertTrue(
                        request.headers[HttpHeaders.Cookie]
                            .orEmpty()
                            .contains("__Secure-better-auth.session_token=secret")
                    )
                    respond(
                        """{"user":$user,"session":{"id":"session-1"}}""",
                        headers = headersOf(HttpHeaders.ContentType, "application/json"),
                    )
                },
            )
        assertEquals("user-1", BetterAuthRepository(restoredClient, restored).session()?.id)
        restoredClient.close()
        restored.clear()
        assertTrue(PersistentCookies(store, origin).get(Url(origin)).isEmpty())
    }

    @Test
    fun `cookie replacement deletion and path restrictions survive restart`() = runTest {
        val store = MemoryCookieStore()
        val cookies = PersistentCookies(store, origin)
        cookies.addCookie(
            Url("$origin/auth"),
            parseServerSetCookieHeader("session=first; Path=/auth; Secure; Max-Age=3600"),
        )
        cookies.addCookie(
            Url("$origin/auth"),
            parseServerSetCookieHeader("session=second; Path=/auth; Secure; Max-Age=3600"),
        )
        val restored = PersistentCookies(store, origin)
        assertEquals("second", restored.get(Url("$origin/auth/get-session")).single().value)
        assertTrue(restored.get(Url("$origin/accounts")).isEmpty())
        assertTrue(restored.get(Url("$origin/authentication")).isEmpty())
        restored.addCookie(
            Url("$origin/auth"),
            parseServerSetCookieHeader("session=; Path=/auth; Secure; Max-Age=0"),
        )
        assertTrue(restored.get(Url("$origin/auth")).isEmpty())
    }

    @Test
    fun `null and expired sessions become signed out but server errors propagate`() = runTest {
        for (status in
            listOf(
                HttpStatusCode.OK,
                HttpStatusCode.Unauthorized,
                HttpStatusCode.ServiceUnavailable,
            )) {
            val cookies = PersistentCookies(MemoryCookieStore(), origin)
            val client =
                createApiClient(
                    origin,
                    cookies,
                    MockEngine { request ->
                        assertEquals("/auth/get-session", request.url.encodedPath)
                        respond(
                            "null",
                            status,
                            headersOf(HttpHeaders.ContentType, "application/json"),
                        )
                    },
                )
            try {
                val repository = BetterAuthRepository(client, cookies)
                if (status.value < 500) assertNull(repository.session())
                else {
                    try {
                        repository.session()
                        fail("Server error must be retriable")
                    } catch (_: io.ktor.client.plugins.ServerResponseException) {
                        /* expected */
                    }
                }
            } finally {
                client.close()
            }
        }
    }

    @Test
    fun `email code and recovery use existing Better Auth payloads`() = runTest {
        val paths = mutableListOf<String>()
        val bodies = mutableListOf<JsonObject>()
        val cookies = PersistentCookies(MemoryCookieStore(), origin)
        val client =
            createApiClient(
                origin,
                cookies,
                MockEngine { request ->
                    paths.add(request.url.encodedPath)
                    bodies.add(
                        Json.parseToJsonElement(
                                (request.body as OutgoingContent.ByteArrayContent)
                                    .bytes()
                                    .decodeToString()
                            )
                            .jsonObject
                    )
                    respond(
                        """{"user":$user,"success":true}""",
                        headers = headersOf(HttpHeaders.ContentType, "application/json"),
                    )
                },
            )
        try {
            val repository = BetterAuthRepository(client, cookies)
            repository.sendCode("alex@example.test")
            assertEquals("sign-in", bodies.last()["type"]?.jsonPrimitive?.content)
            assertEquals("user-1", repository.verifyCode("alex@example.test", "123456").id)
            assertEquals("123456", bodies.last()["otp"]?.jsonPrimitive?.content)
            repository.requestReset("alex@example.test")
            repository.resetPassword("alex@example.test", "654321", "new-password")
            assertEquals("new-password", bodies.last()["password"]?.jsonPrimitive?.content)
            assertEquals("654321", bodies.last()["otp"]?.jsonPrimitive?.content)
            assertEquals(
                listOf(
                    "/auth/email-otp/send-verification-otp",
                    "/auth/sign-in/email-otp",
                    "/auth/email-otp/request-password-reset",
                    "/auth/email-otp/reset-password",
                ),
                paths,
            )
        } finally {
            client.close()
        }
    }

    @Test
    fun `failed sign out retains cookie so revocation can be retried`() = runTest {
        val cookies = PersistentCookies(MemoryCookieStore(), origin)
        cookies.addCookie(
            Url(origin),
            parseServerSetCookieHeader("session=secret; Secure; Path=/; Max-Age=3600"),
        )
        val client =
            createApiClient(
                origin,
                cookies,
                MockEngine {
                    respond(
                        "{}",
                        HttpStatusCode.BadRequest,
                        headersOf(HttpHeaders.ContentType, "application/json"),
                    )
                },
            )
        try {
            try {
                BetterAuthRepository(client, cookies).signOut()
                fail("Must fail")
            } catch (_: ClientRequestException) {
                /* expected */
            }
            assertEquals("secret", cookies.get(Url(origin)).single().value)
        } finally {
            client.close()
        }
    }
}
