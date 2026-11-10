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

    private fun account(id: String = "1", amount: String = "10.25") =
        Account(id, "Everyday", "GBP", "current-account", AccountBalance(BigDecimal(amount), "GBP"))

    override suspend fun list(): List<Account> {
        if (offline) error("offline")
        return listOf(account())
    }

    override suspend fun get(id: String): Account {
        if (id == delayedId) delay(10_000)
        return account(id)
    }

    override suspend fun transactions(id: String): List<AccountTransaction> {
        if (transactionsOffline) error("offline")
        return emptyList()
    }

    override suspend fun create(input: AccountInput): Account {
        writes++
        return account("saved", "-100")
    }

    override suspend fun update(id: String, input: AccountInput): Account = account(id)

    override suspend fun delete(id: String) {
        if (offline) error("offline")
    }
}
