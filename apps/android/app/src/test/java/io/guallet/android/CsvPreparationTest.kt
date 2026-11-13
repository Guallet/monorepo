package io.guallet.android

import io.guallet.android.core.network.*
import io.guallet.android.core.state.AppDispatchers
import io.guallet.android.features.transfer.*
import io.ktor.client.engine.mock.*
import io.ktor.http.*
import io.ktor.http.content.TextContent
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicInteger
import kotlin.coroutines.CoroutineContext
import kotlinx.coroutines.*
import org.junit.Assert.*
import org.junit.Test

class CsvPreparationTest {
    private val fields =
        FieldMappings("Account", "Date", "Amount", "Description", category = "Category")
    private val csv =
        CsvParser.parse(
            "Date,Amount,Description,Account,Category\n2026-11-01,-12.34, Groceries , Bank , Food \ninvalid,5,No date,Bank,Food\n2026-11-02,6,Refund,,\n"
        )

    @Test
    fun `preparation normalizes only relevant columns and separates invalid rows`() = runBlocking {
        val prepared = prepareCsv(csv, fields)
        assertNull(prepared.mappingError)
        assertEquals(listOf("Bank", "default"), prepared.accountKeys)
        assertEquals(listOf("Food"), prepared.categoryKeys)
        assertEquals(2, prepared.validRows.size)
        assertEquals("Bank", prepared.validRows.first()["Account"])
        assertEquals(" Groceries ", prepared.validRows.first()["Description"])
        assertEquals(
            listOf(io.guallet.android.core.state.uiMessage(R.string.message_invalid_date)),
            prepared.previewErrors[1],
        )
    }

    @Test
    fun `incomplete stale and duplicate mappings do not validate the rows`() = runBlocking {
        for (mapping in
            listOf(
                fields.copy(date = ""),
                fields.copy(date = "Missing"),
                fields.copy(date = "Amount"),
            )) {
            val result = prepareCsv(csv, mapping)
            assertNotNull(result.mappingError)
            assertTrue(result.validRows.isEmpty())
            assertTrue(result.previewErrors.isEmpty())
        }
    }

    @Test
    fun `blank account sentinel cannot silently merge a named default account`() = runBlocking {
        val ambiguous =
            CsvParser.parse(
                "Date,Amount,Description,Account,Category\n2026-11-01,1,A,default,\n2026-11-02,2,B,,\n"
            )
        assertNotNull(prepareCsv(ambiguous, fields).mappingError)
    }

    @Test
    fun `large CSV preparation and request encoding use the injected computation dispatcher`() =
        runBlocking {
            val executed = AtomicInteger()
            Executors.newSingleThreadExecutor().asCoroutineDispatcher().use { worker ->
                val computation =
                    object : CoroutineDispatcher() {
                        override fun dispatch(context: CoroutineContext, block: Runnable) {
                            executed.incrementAndGet()
                            worker.dispatch(context, block)
                        }
                    }
                val dispatchers = AppDispatchers(computation = computation)
                var body: String? = null
                val client =
                    createApiClient(
                        "https://api.example.test",
                        PersistentCookies(MemoryCookieStore(), "https://api.example.test"),
                        MockEngine { request ->
                            body = (request.body as TextContent).text
                            respond(
                                """{"jobId":"job","message":"Accepted"}""",
                                headers = headersOf(HttpHeaders.ContentType, "application/json"),
                            )
                        },
                    )
                try {
                    val repository = KtorTransferRepository(client, dispatchers)
                    val model = ImportViewModel(repository, dispatchers)
                    val prepared =
                        model.prepare(
                            CsvData(csv.columns, List(10_000) { csv.rows.first() }),
                            fields,
                        )
                    assertEquals(10_000, prepared.validRows.size)
                    assertEquals(1, executed.get())
                    repository.submit(
                        ImportRequest(prepared.validRows, fields, emptyMap(), emptyMap())
                    )
                    assertEquals(2, executed.get())
                    assertTrue(body!!.contains("csvData"))
                    assertTrue(body!!.contains("-12.34"))
                } finally {
                    client.close()
                }
            }
        }
}
