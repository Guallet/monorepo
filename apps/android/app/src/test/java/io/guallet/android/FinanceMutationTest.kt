package io.guallet.android

import io.guallet.android.core.network.*
import io.guallet.android.features.accounts.domain.*
import io.guallet.android.features.finance.data.KtorFinanceRepository
import io.guallet.android.features.finance.presentation.FinanceViewModel
import io.ktor.client.engine.mock.MockEngine
import kotlinx.coroutines.*
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class FinanceMutationTest {
    private val dispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(dispatcher)
    }

    @After
    fun cleanup() {
        Dispatchers.resetMain()
    }

    @Test
    fun `recreated screen feedback cannot unlock a pending write or discard its completion`() =
        runTest(dispatcher) {
            val client =
                createApiClient(
                    "https://api.example.test",
                    PersistentCookies(MemoryCookieStore(), "https://api.example.test"),
                    MockEngine { error("No network reads expected") },
                )
            val accounts =
                object : AccountsRepository {
                    override suspend fun list() = emptyList<Account>()

                    override suspend fun get(id: String): Account = error("unused")

                    override suspend fun transactions(id: String) = emptyList<AccountTransaction>()

                    override suspend fun create(input: AccountInput): Account = error("unused")

                    override suspend fun update(id: String, input: AccountInput): Account =
                        error("unused")

                    override suspend fun delete(id: String) = Unit
                }
            try {
                val model = FinanceViewModel(KtorFinanceRepository(client), accounts)
                val gate = CompletableDeferred<Unit>()
                var writes = 0
                model.mutate {
                    writes++
                    gate.await()
                }
                runCurrent()
                model.clearMutation()
                model.consumeMutation()
                assertTrue(model.mutation.value.busy)
                model.mutate { writes++ }
                runCurrent()
                assertEquals(1, writes)
                gate.complete(Unit)
                advanceUntilIdle()
                assertTrue(model.mutation.value.completed)
                model.clearMutation()
                assertTrue(model.mutation.value.completed)
                model.consumeMutation()
                assertFalse(model.mutation.value.completed)
                model.mutate { writes++ }
                advanceUntilIdle()
                assertEquals(2, writes)
            } finally {
                client.close()
            }
        }
}
