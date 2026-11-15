package io.guallet.android.features.finance.data

import io.guallet.android.features.budgets.domain.*
import io.guallet.android.features.categories.domain.*
import io.guallet.android.features.finance.domain.FinanceRepository
import io.guallet.android.features.goals.domain.*
import io.guallet.android.features.notifications.domain.*
import io.guallet.android.features.recurring.domain.*
import io.guallet.android.features.settings.domain.*
import io.guallet.android.features.transactions.domain.*
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.resources.*
import io.ktor.client.request.setBody

class KtorFinanceRepository(private val client: HttpClient) : FinanceRepository {
    override suspend fun accountChart(
        id: String,
        startDate: String,
        endDate: String,
    ): io.guallet.android.features.accounts.domain.AccountChart =
        client.get(AccountChartResource(id, startDate, endDate)).body()

    override suspend fun transactions(
        page: Int,
        accounts: String?,
        categories: String?,
        startDate: String?,
        endDate: String?,
    ): TransactionPage =
        client
            .get(
                Transactions(
                    page = page,
                    accounts = accounts,
                    categories = categories,
                    startDate = startDate,
                    endDate = endDate,
                )
            )
            .body()

    override suspend fun transaction(id: String): Transaction =
        client.get(Transactions.Id(id = id)).body()

    override suspend fun createTransaction(input: TransactionInput): Transaction =
        client.post(Transactions()) { setBody(input) }.body()

    override suspend fun updateTransaction(id: String, input: TransactionInput): Transaction =
        client.patch(Transactions.Id(id = id)) { setBody(input) }.body()

    override suspend fun deleteTransaction(id: String) {
        client.delete(Transactions.Id(id = id))
    }

    override suspend fun profile(): UserProfile = client.get(Users()).body()

    override suspend fun settings(): UserSettings = client.get(Users.Settings()).body()

    override suspend fun updateSettings(input: UserSettings): UserSettings =
        client.patch(Users.Settings()) { setBody(input) }.body()

    override suspend fun deleteUser() {
        client.delete(Users())
    }

    override suspend fun budgetTransactions(id: String, month: Int, year: Int): List<Transaction> =
        client.get(BudgetTransactions(id = id, month = month, year = year)).body()

    override suspend fun seedCategories(): List<Category> =
        client.post(SeedCategories()) { setBody(emptyMap<String, String>()) }.body()

    override suspend fun markAllNotificationsRead() {
        client.post(MarkAllRead()) { setBody(emptyMap<String, String>()) }
    }

    override suspend fun categories(): List<Category> = client.get(Categories()).body()

    override suspend fun getCategories(id: String): Category =
        client.get(Categories.Id(id = id)).body()

    override suspend fun createCategories(input: CategoryInput): Category =
        client.post(Categories()) { setBody(input) }.body()

    override suspend fun updateCategories(id: String, input: CategoryInput): Category =
        client.patch(Categories.Id(id = id)) { setBody(input) }.body()

    override suspend fun deleteCategories(id: String) {
        client.delete(Categories.Id(id = id))
    }

    override suspend fun budgets(month: Int?, year: Int?): List<Budget> =
        client.get(Budgets(month = month, year = year)).body()

    override suspend fun getBudgets(id: String): Budget = client.get(Budgets.Id(id = id)).body()

    override suspend fun createBudgets(input: BudgetInput): Budget =
        client.post(Budgets()) { setBody(input) }.body()

    override suspend fun updateBudgets(id: String, input: BudgetInput): Budget =
        client.patch(Budgets.Id(id = id)) { setBody(input) }.body()

    override suspend fun deleteBudgets(id: String) {
        client.delete(Budgets.Id(id = id))
    }

    override suspend fun goals(): List<SavingGoal> = client.get(Goals()).body()

    override suspend fun getGoals(id: String): SavingGoal = client.get(Goals.Id(id = id)).body()

    override suspend fun createGoals(input: GoalInput): SavingGoal =
        client.post(Goals()) { setBody(input) }.body()

    override suspend fun updateGoals(id: String, input: GoalInput): SavingGoal =
        client.patch(Goals.Id(id = id)) { setBody(input) }.body()

    override suspend fun deleteGoals(id: String) {
        client.delete(Goals.Id(id = id))
    }

    override suspend fun recurring(): List<RecurringPayment> = client.get(Recurring()).body()

    override suspend fun getRecurring(id: String): RecurringPayment =
        client.get(Recurring.Id(id = id)).body()

    override suspend fun createRecurring(input: RecurringInput): RecurringPayment =
        client.post(Recurring()) { setBody(input) }.body()

    override suspend fun updateRecurring(id: String, input: RecurringInput): RecurringPayment =
        client.patch(Recurring.Id(id = id)) { setBody(input) }.body()

    override suspend fun deleteRecurring(id: String) {
        client.delete(Recurring.Id(id = id))
    }

    override suspend fun notifications(): List<Notification> = client.get(Notifications()).body()

    override suspend fun getNotifications(id: String): Notification =
        client.get(Notifications.Id(id = id)).body()

    override suspend fun updateNotifications(id: String, input: NotificationUpdate): Notification =
        client.patch(Notifications.Id(id = id)) { setBody(input) }.body()

    override suspend fun deleteNotifications(id: String) {
        client.delete(Notifications.Id(id = id))
    }
}
