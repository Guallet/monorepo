package io.guallet.android.features.finance.domain

import io.guallet.android.features.budgets.domain.*
import io.guallet.android.features.categories.domain.*
import io.guallet.android.features.goals.domain.*
import io.guallet.android.features.notifications.domain.*
import io.guallet.android.features.recurring.domain.*
import io.guallet.android.features.settings.domain.*
import io.guallet.android.features.transactions.domain.*

interface FinanceRepository {
    suspend fun accountChart(
        id: String,
        startDate: String,
        endDate: String,
    ): io.guallet.android.features.accounts.domain.AccountChart

    suspend fun transactions(
        page: Int = 1,
        accounts: String? = null,
        categories: String? = null,
        startDate: String? = null,
        endDate: String? = null,
    ): TransactionPage

    suspend fun transaction(id: String): Transaction

    suspend fun createTransaction(input: TransactionInput): Transaction

    suspend fun updateTransaction(id: String, input: TransactionInput): Transaction

    suspend fun deleteTransaction(id: String)

    suspend fun profile(): UserProfile

    suspend fun settings(): UserSettings

    suspend fun updateSettings(input: UserSettings): UserSettings

    suspend fun deleteUser()

    suspend fun budgetTransactions(id: String, month: Int, year: Int): List<Transaction>

    suspend fun seedCategories(): List<Category>

    suspend fun markAllNotificationsRead()

    suspend fun categories(): List<Category>

    suspend fun getCategories(id: String): Category

    suspend fun createCategories(input: CategoryInput): Category

    suspend fun updateCategories(id: String, input: CategoryInput): Category

    suspend fun deleteCategories(id: String)

    suspend fun budgets(month: Int? = null, year: Int? = null): List<Budget>

    suspend fun getBudgets(id: String): Budget

    suspend fun createBudgets(input: BudgetInput): Budget

    suspend fun updateBudgets(id: String, input: BudgetInput): Budget

    suspend fun deleteBudgets(id: String)

    suspend fun goals(): List<SavingGoal>

    suspend fun getGoals(id: String): SavingGoal

    suspend fun createGoals(input: GoalInput): SavingGoal

    suspend fun updateGoals(id: String, input: GoalInput): SavingGoal

    suspend fun deleteGoals(id: String)

    suspend fun recurring(): List<RecurringPayment>

    suspend fun getRecurring(id: String): RecurringPayment

    suspend fun createRecurring(input: RecurringInput): RecurringPayment

    suspend fun updateRecurring(id: String, input: RecurringInput): RecurringPayment

    suspend fun deleteRecurring(id: String)

    suspend fun notifications(): List<Notification>

    suspend fun getNotifications(id: String): Notification

    suspend fun updateNotifications(id: String, input: NotificationUpdate): Notification

    suspend fun deleteNotifications(id: String)
}
