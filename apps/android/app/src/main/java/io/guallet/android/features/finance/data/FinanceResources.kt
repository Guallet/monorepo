package io.guallet.android.features.finance.data

import io.ktor.resources.Resource

@Resource("/transactions")
class Transactions(
    val page: Int = 1,
    val pageSize: Int = 50,
    val accounts: String? = null,
    val categories: String? = null,
    val startDate: String? = null,
    val endDate: String? = null,
) {
    @Resource("{id}") class Id(val parent: Transactions = Transactions(), val id: String)
}

@Resource("/categories")
class Categories() {
    @Resource("{id}") class Id(val parent: Categories = Categories(), val id: String)
}

@Resource("/budgets")
class Budgets(val month: Int? = null, val year: Int? = null) {
    @Resource("{id}") class Id(val parent: Budgets = Budgets(), val id: String)
}

@Resource("/saving-goals")
class Goals() {
    @Resource("{id}") class Id(val parent: Goals = Goals(), val id: String)
}

@Resource("/regular-payments")
class Recurring() {
    @Resource("{id}") class Id(val parent: Recurring = Recurring(), val id: String)
}

@Resource("/notifications")
class Notifications() {
    @Resource("{id}") class Id(val parent: Notifications = Notifications(), val id: String)
}

@Resource("/users")
class Users {
    @Resource("settings") class Settings(val parent: Users = Users())
}

@Resource("/categories/seed") class SeedCategories

@Resource("/notifications/mark-all-read") class MarkAllRead

@Resource("/budgets/{id}/transactions")
class BudgetTransactions(val id: String, val month: Int, val year: Int)

@Resource("/accounts/{id}/charts")
class AccountChartResource(val id: String, val startDate: String, val endDate: String)
