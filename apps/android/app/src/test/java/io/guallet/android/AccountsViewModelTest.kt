package io.guallet.android

import io.guallet.android.features.accounts.domain.*
import io.guallet.android.features.accounts.presentation.AccountsViewModel
import java.math.BigDecimal
import kotlinx.coroutines.*
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class AccountsViewModelTest {
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
    fun `refresh failure retains visible accounts and can be retried`() =
        runTest(dispatcher) {
            val repository = FakeAccountsRepository()
            val model = AccountsViewModel(repository)
            advanceUntilIdle()
            assertEquals(1, model.state.value.accounts.size)
            repository.offline = true
            model.refresh()
            advanceUntilIdle()
            assertEquals(1, model.state.value.accounts.size)
            assertNotNull(model.state.value.listError)
            repository.offline = false
            model.refresh()
            advanceUntilIdle()
            assertNull(model.state.value.listError)
        }

    @Test
    fun `transaction failure does not hide account details`() =
        runTest(dispatcher) {
            val repository = FakeAccountsRepository().apply { transactionsOffline = true }
            val model = AccountsViewModel(repository)
            advanceUntilIdle()
            model.loadDetails("1")
            advanceUntilIdle()
            assertEquals("1", model.state.value.selected?.id)
            assertNull(model.state.value.detailsError)
            assertNotNull(model.state.value.transactionsError)
            repository.transactionsOffline = false
            model.loadTransactions("1")
            advanceUntilIdle()
            assertNull(model.state.value.transactionsError)
        }

    @Test
    fun `newer detail requests supersede slow previous requests`() =
        runTest(dispatcher) {
            val repository = FakeAccountsRepository().apply { delayedId = "1" }
            val model = AccountsViewModel(repository)
            advanceUntilIdle()
            model.loadDetails("1")
            runCurrent()
            model.loadDetails("2")
            advanceUntilIdle()
            assertEquals("2", model.state.value.selected?.id)
            assertFalse(model.state.value.detailsLoading)
        }

    @Test
    fun `save is single flight and uses returned server balance`() =
        runTest(dispatcher) {
            val repository = FakeAccountsRepository()
            val model = AccountsViewModel(repository)
            advanceUntilIdle()
            val input = AccountInput("Card", "credit-card", "GBP", BigDecimal("100"))
            model.save(null, input)
            model.save(null, input)
            advanceUntilIdle()
            assertEquals(1, repository.writes)
            assertEquals(BigDecimal("-100"), model.state.value.selected?.balance?.amount)
            assertEquals("saved", model.state.value.savedId)
        }

    @Test
    fun `save restarts an initial list read and loads history for the saved account`() =
        runTest(dispatcher) {
            val repository =
                FakeAccountsRepository().apply { firstListGate = CompletableDeferred() }
            val model = AccountsViewModel(repository)
            runCurrent()
            assertTrue(model.state.value.loading)
            model.save(null, AccountInput("New", "current-account", "GBP", BigDecimal.TEN))
            advanceUntilIdle()
            assertEquals(setOf("1", "saved"), model.state.value.accounts.map { it.id }.toSet())
            assertEquals("saved-history-1", model.state.value.transactions.single().id)
            assertFalse(model.state.value.loading)
            assertFalse(model.state.value.transactionsLoading)
            model.clearMutation()
            assertEquals("saved", model.state.value.savedId)
            model.consumeMutation()
            assertNull(model.state.value.savedId)
        }

    @Test
    fun `delete restarts a cancelled list read without losing other server accounts`() =
        runTest(dispatcher) {
            val repository =
                FakeAccountsRepository().apply {
                    includeAccount("2")
                    firstListGate = CompletableDeferred()
                }
            val model = AccountsViewModel(repository)
            runCurrent()
            model.delete("1")
            advanceUntilIdle()
            assertEquals(listOf("2"), model.state.value.accounts.map { it.id })
            assertTrue(model.state.value.deleted)
            assertFalse(model.state.value.loading)
        }

    @Test
    fun `a balance edit reloads the server adjustment history`() =
        runTest(dispatcher) {
            val repository = FakeAccountsRepository()
            val model = AccountsViewModel(repository)
            advanceUntilIdle()
            model.loadDetails("1")
            advanceUntilIdle()
            assertEquals("1-history-0", model.state.value.transactions.single().id)
            model.save("1", AccountInput("Updated", "current-account", "GBP", BigDecimal.TEN))
            advanceUntilIdle()
            assertEquals("1-history-1", model.state.value.transactions.single().id)
        }

    @Test
    fun `unexpected account errors never expose exception details`() =
        runTest(dispatcher) {
            val repository =
                FakeAccountsRepository().apply {
                    readError = IllegalArgumentException("PRIVATE_SERVER_DETAIL")
                }
            val model = AccountsViewModel(repository)
            advanceUntilIdle()
            assertEquals(
                io.guallet.android.core.state.UiMessage.Resource(
                    io.guallet.android.R.string.message_check_the_account_details
                ),
                model.state.value.listError,
            )
            repository.readError = IllegalStateException("PRIVATE_SERVER_DETAIL")
            model.refresh()
            advanceUntilIdle()
            assertEquals(
                io.guallet.android.core.state.UiMessage.Resource(
                    io.guallet.android.R.string
                        .message_the_server_could_not_complete_the_request_try_again
                ),
                model.state.value.listError,
            )
        }

    @Test
    fun `failed deletion retains the account until server confirms success`() =
        runTest(dispatcher) {
            val repository = FakeAccountsRepository().apply { offline = true }
            val model = AccountsViewModel(repository)
            advanceUntilIdle()
            repository.offline = false
            model.refresh()
            advanceUntilIdle()
            repository.offline = true
            model.delete("1")
            advanceUntilIdle()
            assertEquals(1, model.state.value.accounts.size)
            assertFalse(model.state.value.deleted)
            assertNotNull(model.state.value.mutationError)
            repository.offline = false
            model.delete("1")
            advanceUntilIdle()
            assertTrue(model.state.value.accounts.isEmpty())
            assertTrue(model.state.value.deleted)
        }
}

private class FakeAccountsRepository : AccountsRepository {
    var offline = false
    var transactionsOffline = false
    var delayedId: String? = null
    var writes = 0
    var firstListGate: CompletableDeferred<Unit>? = null
    var readError: Exception? = null

    private fun account(id: String = "1", amount: String = "10.25") =
        Account(id, "Everyday", "GBP", "current-account", AccountBalance(BigDecimal(amount), "GBP"))

    private val records = linkedMapOf("1" to account())

    fun includeAccount(id: String) {
        records[id] = account(id)
    }

    override suspend fun list(): List<Account> {
        val gate = firstListGate
        firstListGate = null
        gate?.await()
        readError?.let { throw it }
        if (offline) error("offline")
        return records.values.toList()
    }

    override suspend fun get(id: String): Account {
        if (id == delayedId) delay(10_000)
        return account(id)
    }

    override suspend fun transactions(id: String): List<AccountTransaction> {
        if (transactionsOffline) error("offline")
        return listOf(
            AccountTransaction(
                "$id-history-$writes",
                "Adjustment",
                BigDecimal.ONE,
                "GBP",
                "2026-11-14",
            )
        )
    }

    override suspend fun create(input: AccountInput): Account {
        writes++
        return account("saved", "-100").also { records[it.id] = it }
    }

    override suspend fun update(id: String, input: AccountInput): Account {
        writes++
        return account(id).also { records[id] = it }
    }

    override suspend fun delete(id: String) {
        if (offline) error("offline")
        records.remove(id)
    }
}
