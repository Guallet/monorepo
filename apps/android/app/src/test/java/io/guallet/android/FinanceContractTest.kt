package io.guallet.android

import io.guallet.android.core.network.*
import io.guallet.android.features.budgets.domain.BudgetInput
import io.guallet.android.features.finance.data.KtorFinanceRepository
import io.guallet.android.features.goals.domain.GoalInput
import io.guallet.android.features.notifications.domain.NotificationUpdate
import io.guallet.android.features.recurring.domain.RecurringInput
import io.guallet.android.features.settings.domain.*
import io.guallet.android.features.transfer.*
import io.ktor.client.engine.mock.*
import io.ktor.http.*
import io.ktor.http.content.OutgoingContent
import java.math.BigDecimal
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.*
import org.junit.Assert.*
import org.junit.Test

class FinanceContractTest {
    private val origin = "https://api.example.test"
    private val budget =
        """{"id":"b","name":"Food","amount":"100.25","currency":"GBP","spent":20,"categories":["c"]}"""
    private val category = """{"id":"c","name":"Food","icon":null,"colour":null,"parentId":null}"""
    private val goal =
        """{"id":"g","name":"Holiday","targetAmount":"500","accounts":["a"],"currentAmount":100,"progressPercentage":20,"isCompleted":false,"isOverdue":false,"remainingAmount":400,"daysRemaining":null}"""
    private val payment =
        """{"id":"r","name":"Rent","amount":"250","currency":"GBP","cadence":"monthly","type":"regular_payment","startDate":null,"categoryId":null}"""
    private val notification =
        """{"id":"n","message":"Updated","type":"info","isRead":false,"createdAt":"2026-11-13T12:00:00Z","action":null,"icon":null}"""

    @Test
    fun `planning resources match backend routes nullable fields and decimal encodings`() =
        runTest {
            val seen = mutableListOf<Pair<HttpMethod, String>>()
            val client =
                createApiClient(
                    origin,
                    PersistentCookies(MemoryCookieStore(), origin),
                    MockEngine { request ->
                        seen.add(request.method to request.url.encodedPath)
                        val root = request.url.segments.first { it.isNotEmpty() }
                        val response =
                            when (root) {
                                "budgets" -> budget
                                "categories" -> category
                                "saving-goals" -> goal
                                "regular-payments" -> payment
                                else -> notification
                            }
                        val list =
                            request.method == HttpMethod.Get &&
                                request.url.segments.count { it.isNotEmpty() } == 1
                        if (
                            request.url.encodedPath == "/budgets" &&
                                request.method == HttpMethod.Get
                        ) {
                            assertEquals("11", request.url.parameters["month"])
                            assertEquals("2026", request.url.parameters["year"])
                        }
                        if (
                            request.method == HttpMethod.Post || request.method == HttpMethod.Patch
                        ) {
                            val body =
                                Json.parseToJsonElement(
                                        (request.body as OutgoingContent.ByteArrayContent)
                                            .bytes()
                                            .decodeToString()
                                    )
                                    .jsonObject
                            body["amount"]?.let { assertFalse(it.jsonPrimitive.isString) }
                            if (root == "regular-payments")
                                assertEquals(
                                    "regular_payment",
                                    body["type"]?.jsonPrimitive?.content,
                                )
                            if (root == "notifications")
                                assertEquals(true, body["isRead"]?.jsonPrimitive?.boolean)
                        }
                        respond(
                            if (list) "[$response]" else response,
                            headers = headersOf(HttpHeaders.ContentType, "application/json"),
                        )
                    },
                )
            try {
                val repository = KtorFinanceRepository(client)
                assertEquals(BigDecimal("100.25"), repository.budgets(11, 2026).single().amount)
                assertNull(repository.categories().single().icon)
                assertEquals("g", repository.goals().single().id)
                assertNull(repository.recurring().single().startDate)
                repository.createBudgets(
                    BudgetInput("Food", BigDecimal("100.25"), "GBP", listOf("c"))
                )
                repository.updateBudgets(
                    "b",
                    BudgetInput("Food", BigDecimal("100.25"), "GBP", listOf("c")),
                )
                repository.createGoals(GoalInput("Holiday", BigDecimal("500"), listOf("a")))
                repository.createRecurring(
                    RecurringInput("Rent", BigDecimal("250"), "GBP", "monthly", "regular_payment")
                )
                repository.updateNotifications("n", NotificationUpdate(true))
                repository.deleteGoals("g")
                assertTrue(seen.contains(HttpMethod.Post to "/regular-payments"))
                assertTrue(seen.contains(HttpMethod.Patch to "/budgets/b"))
                assertTrue(seen.contains(HttpMethod.Delete to "/saving-goals/g"))
            } finally {
                client.close()
            }
        }

    @Test
    fun `transaction filters use backend comma-separated IDs and pagination metadata`() = runTest {
        val client =
            createApiClient(
                origin,
                PersistentCookies(MemoryCookieStore(), origin),
                MockEngine { request ->
                    assertEquals("/transactions", request.url.encodedPath)
                    assertEquals("2", request.url.parameters["page"])
                    assertEquals("a,b", request.url.parameters["accounts"])
                    assertEquals("c,d", request.url.parameters["categories"])
                    assertEquals("2026-11-01T00:00:00Z", request.url.parameters["startDate"])
                    respond(
                        """{"meta":{"total":51,"page":2,"pageSize":50,"hasMore":false},"transactions":[]}""",
                        headers = headersOf(HttpHeaders.ContentType, "application/json"),
                    )
                },
            )
        try {
            assertEquals(
                51,
                KtorFinanceRepository(client)
                    .transactions(2, "a,b", "c,d", "2026-11-01T00:00:00Z")
                    .meta
                    .total,
            )
        } finally {
            client.close()
        }
    }

    @Test
    fun `export remains a queued request and importer uses mappings plus encoded job resource`() =
        runTest {
            val client =
                createApiClient(
                    origin,
                    PersistentCookies(MemoryCookieStore(), origin),
                    MockEngine { request ->
                        val response =
                            when (request.url.encodedPath) {
                                "/data/import" -> {
                                    val body =
                                        Json.parseToJsonElement(
                                                (request.body as OutgoingContent.ByteArrayContent)
                                                    .bytes()
                                                    .decodeToString()
                                            )
                                            .jsonObject
                                    assertEquals("csv", body["format"]?.jsonPrimitive?.content)
                                    assertEquals(
                                        "amount",
                                        body["fieldMappings"]
                                            ?.jsonObject
                                            ?.get("amount")
                                            ?.jsonPrimitive
                                            ?.content,
                                    )
                                    """{"jobId":"job-1","message":"Queued","processedCount":0,"failedCount":0}"""
                                }
                                "/data/import/job-1" ->
                                    """{"status":"running","progress":25,"processedCount":5,"failedCount":0}"""
                                "/data/export" -> """{"message":"Queued"}"""
                                else -> error("Unexpected path")
                            }
                        respond(
                            response,
                            headers = headersOf(HttpHeaders.ContentType, "application/json"),
                        )
                    },
                )
            try {
                val repository = KtorTransferRepository(client)
                val request =
                    ImportRequest(
                        listOf(
                            mapOf(
                                "date" to "2026-11-13",
                                "amount" to "1.25",
                                "description" to "Coffee",
                            )
                        ),
                        FieldMappings(
                            date = "date",
                            amount = "amount",
                            description = "description",
                        ),
                        mapOf("default" to AccountMapping("Bank", false, "a")),
                        emptyMap(),
                    )
                assertEquals("job-1", repository.submit(request).jobId)
                assertEquals("running", repository.status("job-1").status)
                assertEquals("Queued", repository.export(ExportRequest("csv")).message)
            } finally {
                client.close()
            }
        }

    @Test
    fun `user settings preserve preferred currencies and date format through patch`() = runTest {
        val client =
            createApiClient(
                origin,
                PersistentCookies(MemoryCookieStore(), origin),
                MockEngine { request ->
                    assertEquals("/users/settings", request.url.encodedPath)
                    assertEquals(HttpMethod.Patch, request.method)
                    val body =
                        (request.body as OutgoingContent.ByteArrayContent).bytes().decodeToString()
                    assertTrue(body.contains("preferred_currencies"))
                    assertTrue(body.contains("date_format"))
                    respond(body, headers = headersOf(HttpHeaders.ContentType, "application/json"))
                },
            )
        try {
            val settings =
                UserSettings(CurrencyPreferences("JPY", listOf("GBP", "JPY")), "YYYY/MM/DD")
            assertEquals(settings, KtorFinanceRepository(client).updateSettings(settings))
        } finally {
            client.close()
        }
    }
}
