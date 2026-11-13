package io.guallet.android.features.finance.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.guallet.android.core.state.*
import io.guallet.android.features.accounts.domain.*
import io.guallet.android.features.budgets.domain.*
import io.guallet.android.features.categories.domain.*
import io.guallet.android.features.finance.domain.FinanceRepository
import io.guallet.android.features.goals.domain.*
import io.guallet.android.features.notifications.domain.*
import io.guallet.android.features.recurring.domain.*
import io.guallet.android.features.settings.domain.*
import io.guallet.android.features.transactions.domain.*
import java.time.YearMonth
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class MutationState(
    val busy: Boolean = false,
    val error: String? = null,
    val completed: Boolean = false,
)

class FinanceViewModel(
    val repository: FinanceRepository,
    private val accountsRepository: AccountsRepository,
) : ViewModel() {
    private val expired = MutableStateFlow(false)
    val unauthorized = expired.asStateFlow()

    private fun expired() {
        expired.value = true
    }

    private fun <T> resource() = RemoteResource<T>(viewModelScope, ::expired)

    val accountChart = resource<AccountChart>()

    fun loadAccountChart(id: String) {
        val now = java.time.Instant.now()
        accountChart.load(key = id) {
            repository.accountChart(
                id,
                now.minus(java.time.Duration.ofDays(90)).toString(),
                now.toString(),
            )
        }
    }

    val cashflow = resource<List<Transaction>>()
    val recent = resource<TransactionPage>()
    val accounts = resource<List<Account>>()
    val categories = resource<List<Category>>()
    val budgets = resource<List<Budget>>()
    val goals = resource<List<SavingGoal>>()
    val recurring = resource<List<RecurringPayment>>()
    val notifications = resource<List<Notification>>()
    val profile = resource<UserProfile>()
    val settings = resource<UserSettings>()
    val transactions = resource<TransactionPage>()
    val transaction = resource<Transaction>()
    val budgetTransactions = resource<List<Transaction>>()
    private val mutationMutable = MutableStateFlow(MutationState())
    val mutation = mutationMutable.asStateFlow()
    var month = YearMonth.now()
        private set

    var transactionFilter = TransactionFilter()
        private set

    fun loadAccounts() = accounts.load { accountsRepository.list() }

    fun loadCategories() = categories.load { repository.categories() }

    fun loadBudgets(value: YearMonth = month) {
        month = value
        budgets.load(key = value) { repository.budgets(value.monthValue, value.year) }
    }

    fun loadBudgetTransactions(id: String) =
        budgetTransactions.load(key = listOf(id, month)) {
            repository.budgetTransactions(id, month.monthValue, month.year)
        }

    fun loadGoals() = goals.load { repository.goals() }

    fun loadRecurring() = recurring.load { repository.recurring() }

    fun loadNotifications() = notifications.load { repository.notifications() }

    fun loadSettings() {
        profile.load { repository.profile() }
        settings.load { repository.settings() }
    }

    fun loadTransactions(filter: TransactionFilter = transactionFilter) {
        transactionFilter = filter
        transactions.load(key = filter) {
            repository.transactions(
                filter.page,
                filter.accounts,
                filter.categories,
                filter.startDate,
                filter.endDate,
            )
        }
    }

    fun loadTransaction(id: String) = transaction.load(key = id) { repository.transaction(id) }

    fun loadRecent() = recent.load { repository.transactions() }

    fun loadCashflow() =
        cashflow.load {
            val now = java.time.Instant.now()
            val start = now.minus(java.time.Duration.ofDays(30)).toString()
            val all = mutableListOf<Transaction>()
            var page = 1
            while (true) {
                val response =
                    repository.transactions(page, startDate = start, endDate = now.toString())
                require(response.meta.page == page) {
                    "Could not load the complete cashflow period."
                }
                all.addAll(response.transactions)
                if (!response.meta.hasMore) break
                require(response.transactions.isNotEmpty()) {
                    "Could not load the complete cashflow period."
                }
                page++
            }
            all.distinctBy { it.id }
        }

    fun dashboard() {
        loadRecent()
        loadCashflow()
        loadAccounts()
        loadGoals()
        loadNotifications()
        loadSettings()
    }

    fun clearMutation() {
        mutationMutable.value = MutationState()
    }

    fun mutate(action: suspend () -> Unit) {
        if (mutationMutable.value.busy) return
        mutationMutable.value = MutationState(busy = true)
        viewModelScope.launch {
            try {
                action()
                mutationMutable.value = MutationState(completed = true)
            } catch (error: Exception) {
                mutationMutable.value = MutationState(error = apiError(error, ::expired))
            }
        }
    }
}

data class TransactionFilter(
    val page: Int = 1,
    val accounts: String? = null,
    val categories: String? = null,
    val startDate: String? = null,
    val endDate: String? = null,
)
