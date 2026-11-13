package io.guallet.android.features.planning

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.guallet.android.R
import io.guallet.android.core.money.*
import io.guallet.android.core.state.*
import io.guallet.android.features.budgets.domain.*
import io.guallet.android.features.finance.presentation.FinanceViewModel
import io.guallet.android.features.goals.domain.*
import io.guallet.android.features.recurring.domain.*
import io.guallet.android.features.transactions.presentation.TransactionCard
import io.guallet.android.features.transactions.presentation.transactionDate
import io.guallet.android.ui.components.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.YearMonth

private val cadenceLabels =
    listOf(
        "weekly" to R.string.weekly,
        "biweekly" to R.string.every_two_weeks,
        "monthly" to R.string.monthly,
        "quarterly" to R.string.quarterly,
        "yearly" to R.string.yearly,
    )
private val paymentLabels =
    listOf(
        "subscription" to R.string.subscription,
        "regular_payment" to R.string.payment,
        "regular_income" to R.string.income,
    )

@Composable
fun BudgetsScreen(
    model: FinanceViewModel,
    open: (String) -> Unit,
    create: () -> Unit,
    month: YearMonth,
    onMonthChange: (YearMonth) -> Unit,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val state by model.budgets.state.collectAsStateWithLifecycle()
    LaunchedEffect(month) { model.loadBudgets(month) }
    FinanceListPage(resources.getString(R.string.budgets)) {
        item("controls") {
            Column(
                verticalArrangement =
                    Arrangement.spacedBy(io.guallet.android.ui.theme.GualletTokens.gutter)
            ) {
                Row {
                    TextButton(onClick = { onMonthChange(month.minusMonths(1)) }) {
                        Text(resources.getString(R.string.previous_month))
                    }
                    TextButton(onClick = { onMonthChange(month.plusMonths(1)) }) {
                        Text(resources.getString(R.string.next_month))
                    }
                }
                Text(month.toString(), style = MaterialTheme.typography.titleLarge)
                Button(onClick = create) { Text(resources.getString(R.string.add_budget)) }
            }
        }
        remoteItems(state, { model.loadBudgets(month) }) { budgets ->
            if (budgets.isEmpty())
                item("empty") { Text(resources.getString(R.string.no_budgets_yet)) }
            budgets
                .groupBy { it.currency }
                .forEach { (currency, group) ->
                    item("summary:$currency") {
                        FinanceCard {
                            Text(resources.getString(R.string.value_monthly_budget_total, currency))
                            MoneyLabel(
                                group.fold(BigDecimal.ZERO) { total, item -> total + item.amount },
                                currency,
                            )
                            Text(resources.getString(R.string.spent))
                            MoneyLabel(
                                group.fold(BigDecimal.ZERO) { total, item -> total + item.spent },
                                currency,
                            )
                        }
                    }
                }
            items(budgets, key = { "budget:${it.id}" }) { budget ->
                FinanceCard {
                    CategorySymbol(budget.icon, budget.colour)
                    Text(budget.name, style = MaterialTheme.typography.titleLarge)
                    MoneyLabel(budget.spent, budget.currency)
                    Text("of")
                    MoneyLabel(budget.amount, budget.currency)
                    LinearProgressIndicator(
                        progress = {
                            if (budget.amount.signum() <= 0) 0f
                            else
                                (budget.spent.toDouble() / budget.amount.toDouble())
                                    .toFloat()
                                    .coerceIn(0f, 1f)
                        },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    TextButton(onClick = { open(budget.id) }) {
                        Text(resources.getString(R.string.view_budget))
                    }
                }
            }
        }
    }
}

@Composable
fun BudgetDetails(
    id: String,
    model: FinanceViewModel,
    onBack: () -> Unit,
    edit: () -> Unit,
    transaction: (String) -> Unit,
    month: YearMonth,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val state by model.budgets.state.collectAsStateWithLifecycle()
    val transactions by model.budgetTransactions.state.collectAsStateWithLifecycle()
    val mutation by model.mutation.collectAsStateWithLifecycle()
    var deleting by remember { mutableStateOf(false) }
    LaunchedEffect(id, month) {
        model.clearMutation()
        model.loadBudgets(month)
        model.loadBudgetTransactions(id, month)
    }
    LaunchedEffect(mutation.completed) {
        if (mutation.completed) {
            model.clearMutation()
            onBack()
        }
    }
    FinanceListPage(resources.getString(R.string.budget), onBack) {
        remoteItems(state, { model.loadBudgets(month) }, "budget") { list ->
            val budget = list.find { it.id == id }
            item("details") {
                if (budget == null)
                    Text(resources.getString(R.string.this_budget_is_no_longer_available))
                else
                    FinanceCard {
                        CategorySymbol(budget.icon, budget.colour)
                        Text(budget.name, style = MaterialTheme.typography.titleLarge)
                        Text(resources.getString(R.string.budget_for_value, month))
                        MoneyLabel(budget.amount, budget.currency)
                        Text(resources.getString(R.string.spent))
                        MoneyLabel(budget.spent, budget.currency)
                        Text(resources.getString(R.string.remaining))
                        MoneyLabel(budget.amount - budget.spent, budget.currency)
                        Row {
                            TextButton(enabled = !mutation.busy, onClick = edit) {
                                Text(resources.getString(R.string.edit))
                            }
                            TextButton(enabled = !mutation.busy, onClick = { deleting = true }) {
                                Text(resources.getString(R.string.action_delete))
                            }
                        }
                    }
            }
        }
        item("feedback") {
            Column {
                MutationFeedback(mutation)
                Text(
                    resources.getString(R.string.transactions),
                    style = MaterialTheme.typography.titleLarge,
                )
            }
        }
        remoteItems(
            transactions.copy(
                value = transactions.value.takeIf { transactions.requestKey == listOf(id, month) }
            ),
            { model.loadBudgetTransactions(id, month) },
            "transactions",
        ) { list ->
            if (list.isEmpty())
                item("empty") {
                    Text(resources.getString(R.string.no_transactions_for_this_budget_this_month))
                }
            items(list, key = { "transaction:${it.id}" }) { item ->
                TransactionCard(item, { transaction(item.id) })
            }
        }
    }
    if (deleting)
        ConfirmDelete(
            resources.getString(R.string.delete_budget),
            mutation.busy,
            { deleting = false },
        ) {
            model.mutate { model.repository.deleteBudgets(id) }
        }
}

@Composable
fun BudgetFormScreen(
    id: String?,
    model: FinanceViewModel,
    defaultCurrency: String,
    onBack: () -> Unit,
    month: YearMonth,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val budgets by model.budgets.state.collectAsStateWithLifecycle()
    val accounts by model.accounts.state.collectAsStateWithLifecycle()
    val categories by model.categories.state.collectAsStateWithLifecycle()
    val mutation by model.mutation.collectAsStateWithLifecycle()
    LaunchedEffect(id) {
        model.clearMutation()
        model.loadAccounts()
        model.loadCategories()
        if (id != null) model.loadBudgets(month)
    }
    LaunchedEffect(mutation.completed) {
        if (mutation.completed) {
            model.clearMutation()
            onBack()
        }
    }
    val item = budgets.value?.find { it.id == id }
    if ((id != null && (item == null)) || accounts.value == null || categories.value == null) {
        FinancePage(resources.getString(R.string.budget), onBack) {
            RemoteContent(budgets, { model.loadBudgets(month) }) {}
            RemoteContent(accounts, model::loadAccounts) {}
            RemoteContent(categories, model::loadCategories) {}
            if (id != null && !budgets.loading && budgets.value != null && item == null)
                Text(resources.getString(R.string.this_budget_is_no_longer_available))
        }
        return
    }
    key(id) {
        var name by rememberSaveable { mutableStateOf(item?.name.orEmpty()) }
        var currency by rememberSaveable {
            mutableStateOf(
                item?.currency
                    ?: accounts.value.orEmpty().firstOrNull()?.currency
                    ?: defaultCurrency
            )
        }
        var amount by rememberSaveable { mutableStateOf(item?.amount?.toPlainString().orEmpty()) }
        var selected by rememberSaveable {
            mutableStateOf(
                item?.categories.orEmpty().filter { id ->
                    categories.value.orEmpty().any { it.id == id }
                }
            )
        }
        var colour by rememberSaveable { mutableStateOf(item?.colour ?: "#005EB8") }
        var icon by rememberSaveable { mutableStateOf(item?.icon ?: "IconPigMoney") }
        var error by remember { mutableStateOf<String?>(null) }
        val initial = remember {
            listOf(
                item?.name.orEmpty(),
                item?.currency
                    ?: accounts.value.orEmpty().firstOrNull()?.currency
                    ?: defaultCurrency,
                item?.amount?.toPlainString().orEmpty(),
                item
                    ?.categories
                    .orEmpty()
                    .filter { id -> categories.value.orEmpty().any { it.id == id } }
                    .joinToString(),
                item?.colour ?: "#005EB8",
                item?.icon ?: "IconPigMoney",
            )
        }
        val back =
            rememberFormBackHandler(
                initial != listOf(name, currency, amount, selected.joinToString(), colour, icon),
                mutation.busy,
                onBack,
            )
        FinancePage(
            if (id == null) resources.getString(R.string.add_budget)
            else resources.getString(R.string.edit_budget),
            back,
        ) {
            TextField(
                resources.getString(R.string.name),
                name,
                !mutation.busy,
                onChange = {
                    name = it
                    error = null
                },
            )
            val currencies =
                (accounts.value.orEmpty().map { it.currency } + listOfNotNull(item?.currency))
                    .distinct()
            ChoiceField(
                resources.getString(R.string.currency),
                currency,
                currencies.map { it to it },
                !mutation.busy,
            ) {
                currency = it
            }
            TextField(
                resources.getString(R.string.monthly_amount),
                amount,
                !mutation.busy,
                KeyboardType.Decimal,
                onChange = {
                    amount = it
                    error = null
                },
            )
            TextField(
                resources.getString(R.string.colour_rrggbb),
                colour,
                !mutation.busy,
                onChange = { colour = it },
            )
            IconChoiceField(icon, !mutation.busy) { icon = it }
            MultiChoice(
                resources.getString(R.string.categories),
                selected.toSet(),
                categories.value.orEmpty().map { it.id to it.name },
                !mutation.busy,
            ) {
                selected = it.toList()
            }
            error?.let { ErrorNotice(it) }
            MutationFeedback(mutation)
            Button(
                enabled = !mutation.busy,
                onClick = {
                    try {
                        require(name.trim().length >= 2) {
                            resources.getString(R.string.enter_a_name_with_at_least_two_characters)
                        }
                        require(currency in currencies) {
                            resources.getString(R.string.choose_a_currency_used_by_an_account)
                        }
                        val money = Money.parse(amount, currency)
                        require(money.amount.signum() > 0 && selected.isNotEmpty()) {
                            resources.getString(
                                R.string.enter_an_amount_above_zero_and_select_at_least_one_category
                            )
                        }
                        require(Regex("#[0-9a-fA-F]{6}").matches(colour)) {
                            resources.getString(R.string.enter_a_six_digit_hex_colour)
                        }
                        val input =
                            BudgetInput(name.trim(), money.amount, currency, selected, colour, icon)
                        model.mutate {
                            if (id == null) model.repository.createBudgets(input)
                            else model.repository.updateBudgets(id, input)
                        }
                    } catch (failure: IllegalArgumentException) {
                        error = failure.userMessage(resources)
                    }
                },
            ) {
                Text(resources.getString(R.string.save_budget))
            }
            TextButton(enabled = !mutation.busy, onClick = back) {
                Text(resources.getString(R.string.cancel))
            }
        }
    }
}

@Composable
fun GoalsScreen(
    model: FinanceViewModel,
    onBack: () -> Unit,
    open: (String) -> Unit,
    create: () -> Unit,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val goals by model.goals.state.collectAsStateWithLifecycle()
    val accounts by model.accounts.state.collectAsStateWithLifecycle()
    LaunchedEffect(Unit) {
        model.loadGoals()
        model.loadAccounts()
    }
    FinanceListPage(resources.getString(R.string.savings_goals), onBack) {
        item("create") {
            Button(onClick = create) { Text(resources.getString(R.string.add_savings_goal)) }
        }
        remoteItems(goals, model::loadGoals) { list ->
            if (list.isEmpty())
                item("empty") { Text(resources.getString(R.string.no_savings_goals_yet)) }
            items(list.sortedByDescending { it.priority ?: 0 }, key = { "goal:${it.id}" }) { goal ->
                FinanceCard {
                    Text(goal.name, style = MaterialTheme.typography.titleLarge)
                    val currencies =
                        accounts.value
                            .orEmpty()
                            .filter { it.id in goal.accounts }
                            .map { it.currency }
                            .distinct()
                    if (currencies.size == 1) {
                        MoneyLabel(goal.currentAmount, currencies.single())
                        Text(resources.getString(R.string.target))
                        MoneyLabel(goal.targetAmount, currencies.single())
                    } else
                        Text(
                            resources.getString(
                                R.string.select_accounts_with_one_currency_to_display_goal_amounts
                            )
                        )
                    LinearProgressIndicator(
                        progress = { (goal.progressPercentage / 100).toFloat().coerceIn(0f, 1f) },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    if (goal.isCompleted) Text(resources.getString(R.string.complete))
                    else if (goal.isOverdue) Text(resources.getString(R.string.overdue))
                    TextButton(onClick = { open(goal.id) }) {
                        Text(resources.getString(R.string.view_goal))
                    }
                }
            }
        }
    }
}

@Composable
fun GoalDetails(id: String, model: FinanceViewModel, onBack: () -> Unit, edit: () -> Unit) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val goals by model.goals.state.collectAsStateWithLifecycle()
    val accounts by model.accounts.state.collectAsStateWithLifecycle()
    val mutation by model.mutation.collectAsStateWithLifecycle()
    var deleting by remember { mutableStateOf(false) }
    LaunchedEffect(id) {
        model.clearMutation()
        model.loadGoals()
        model.loadAccounts()
    }
    LaunchedEffect(mutation.completed) {
        if (mutation.completed) {
            model.clearMutation()
            onBack()
        }
    }
    FinanceListPage(resources.getString(R.string.savings_goal), onBack) {
        remoteItems(goals, model::loadGoals) { list ->
            val goal = list.find { it.id == id }
            if (goal == null)
                item("missing") {
                    Text(resources.getString(R.string.this_goal_is_no_longer_available))
                }
            else {
                val linked = accounts.value.orEmpty().filter { it.id in goal.accounts }
                item("goal-details") {
                    FinanceCard {
                        Text(goal.name, style = MaterialTheme.typography.headlineMedium)
                        goal.description?.let { Text(it) }
                        val currency = linked.map { it.currency }.distinct().singleOrNull()
                        if (currency != null) {
                            Text(resources.getString(R.string.saved))
                            MoneyLabel(goal.currentAmount, currency)
                            Text(resources.getString(R.string.target))
                            MoneyLabel(goal.targetAmount, currency)
                            Text(resources.getString(R.string.remaining))
                            MoneyLabel(goal.remainingAmount, currency)
                        } else
                            Text(
                                resources.getString(
                                    R.string
                                        .goal_currency_unavailable_mixed_currencies_are_not_converted
                                )
                            )
                        goal.targetDate?.let {
                            Text(
                                resources.getString(
                                    R.string.target_date_value,
                                    formatPreferenceDate(
                                        it.take(10).toString(),
                                        LocalDateFormat.current,
                                    ),
                                )
                            )
                        }
                        if (goal.isCompleted) Text(resources.getString(R.string.complete))
                        else if (goal.isOverdue) Text(resources.getString(R.string.overdue))
                        Row {
                            TextButton(onClick = edit, enabled = !mutation.busy) {
                                Text(resources.getString(R.string.edit))
                            }
                            TextButton(enabled = !mutation.busy, onClick = { deleting = true }) {
                                Text(resources.getString(R.string.action_delete))
                            }
                        }
                    }
                }
                items(linked, key = { "linked-account:${it.id}" }) { Text(it.name) }
            }
        }
        item("mutation") { MutationFeedback(mutation) }
    }
    if (deleting)
        ConfirmDelete(
            resources.getString(R.string.delete_savings_goal),
            mutation.busy,
            { deleting = false },
        ) {
            model.mutate { model.repository.deleteGoals(id) }
        }
}

@Composable
fun GoalFormScreen(id: String?, model: FinanceViewModel, onBack: () -> Unit) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val goals by model.goals.state.collectAsStateWithLifecycle()
    val accounts by model.accounts.state.collectAsStateWithLifecycle()
    val mutation by model.mutation.collectAsStateWithLifecycle()
    LaunchedEffect(id) {
        model.clearMutation()
        model.loadAccounts()
        if (id != null) model.loadGoals()
    }
    LaunchedEffect(mutation.completed) {
        if (mutation.completed) {
            model.clearMutation()
            onBack()
        }
    }
    val item = goals.value?.find { it.id == id }
    if (accounts.value == null || (id != null && (item == null))) {
        FinancePage(resources.getString(R.string.savings_goal), onBack) {
            RemoteContent(accounts, model::loadAccounts) {}
            RemoteContent(goals, model::loadGoals) {}
            if (id != null && !goals.loading && goals.value != null && item == null)
                Text(resources.getString(R.string.this_goal_is_no_longer_available))
        }
        return
    }
    key(id) {
        var name by rememberSaveable { mutableStateOf(item?.name.orEmpty()) }
        var description by rememberSaveable { mutableStateOf(item?.description.orEmpty()) }
        var amount by rememberSaveable {
            mutableStateOf(item?.targetAmount?.toPlainString().orEmpty())
        }
        var selected by rememberSaveable {
            mutableStateOf(
                item?.accounts.orEmpty().filter { id ->
                    accounts.value.orEmpty().any { it.id == id }
                }
            )
        }
        var date by rememberSaveable { mutableStateOf(item?.targetDate?.take(10).orEmpty()) }
        var priority by rememberSaveable { mutableStateOf((item?.priority ?: 0).toString()) }
        var error by remember { mutableStateOf<String?>(null) }
        val initial = remember {
            listOf(
                item?.name.orEmpty(),
                item?.description.orEmpty(),
                item?.targetAmount?.toPlainString().orEmpty(),
                item
                    ?.accounts
                    .orEmpty()
                    .filter { id -> accounts.value.orEmpty().any { it.id == id } }
                    .joinToString(),
                item?.targetDate?.take(10).orEmpty(),
                (item?.priority ?: 0).toString(),
            )
        }
        val back =
            rememberFormBackHandler(
                initial !=
                    listOf(name, description, amount, selected.joinToString(), date, priority),
                mutation.busy,
                onBack,
            )
        FinancePage(
            if (id == null) resources.getString(R.string.add_savings_goal)
            else resources.getString(R.string.edit_savings_goal),
            back,
        ) {
            TextField(
                resources.getString(R.string.name),
                name,
                !mutation.busy,
                onChange = {
                    name = it
                    error = null
                },
            )
            TextField(
                resources.getString(R.string.description),
                description,
                !mutation.busy,
                multiline = true,
                onChange = { description = it },
            )
            MultiChoice(
                resources.getString(R.string.linked_accounts),
                selected.toSet(),
                accounts.value.orEmpty().map { it.id to "${it.name} (${it.currency})" },
                !mutation.busy,
            ) {
                selected = it.toList()
            }
            TextField(
                resources.getString(R.string.target_amount),
                amount,
                !mutation.busy,
                KeyboardType.Decimal,
                onChange = {
                    amount = it
                    error = null
                },
            )
            TextField(
                resources.getString(R.string.target_date_yyyy_mm_dd_optional),
                date,
                !mutation.busy,
                onChange = {
                    date = it
                    error = null
                },
            )
            TextField(
                resources.getString(R.string.priority),
                priority,
                !mutation.busy,
                KeyboardType.Number,
                onChange = { priority = it },
            )
            error?.let { ErrorNotice(it) }
            MutationFeedback(mutation)
            Button(
                enabled = !mutation.busy,
                onClick = {
                    try {
                        require(name.isNotBlank()) {
                            resources.getString(R.string.enter_a_goal_name)
                        }
                        val available = accounts.value.orEmpty().filter { it.id in selected }
                        require(available.isNotEmpty()) {
                            resources.getString(R.string.select_at_least_one_available_account)
                        }
                        val currency = available.map { it.currency }.distinct().singleOrNull()
                        require(currency != null) {
                            resources.getString(
                                R.string
                                    .choose_accounts_with_the_same_currency_currency_conversion_is_not_available
                            )
                        }
                        val money = Money.parse(amount, currency)
                        require(money.amount.signum() > 0) {
                            resources.getString(R.string.enter_an_amount_above_zero)
                        }
                        val input =
                            GoalInput(
                                name.trim(),
                                money.amount,
                                available.map { it.id },
                                description.ifBlank { null },
                                date.takeIf { it.isNotBlank() }?.let { transactionDate(it) },
                                priority.toInt(),
                            )
                        model.mutate {
                            if (id == null) model.repository.createGoals(input)
                            else model.repository.updateGoals(id, input)
                        }
                    } catch (failure: Exception) {
                        error =
                            failure.userMessage(resources)
                                ?: resources.getString(R.string.check_the_goal_details)
                    }
                },
            ) {
                Text(resources.getString(R.string.save_goal))
            }
            TextButton(enabled = !mutation.busy, onClick = back) {
                Text(resources.getString(R.string.cancel))
            }
        }
    }
}

@Composable
fun RecurringScreen(
    model: FinanceViewModel,
    onBack: () -> Unit,
    open: (String) -> Unit,
    create: () -> Unit,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current
    val cadenceOptions = cadenceLabels.map { it.first to resources.getString(it.second) }
    val paymentOptions = paymentLabels.map { it.first to resources.getString(it.second) }

    val state by model.recurring.state.collectAsStateWithLifecycle()
    var search by rememberSaveable { mutableStateOf("") }
    var view by rememberSaveable { mutableStateOf("upcoming") }
    var type by rememberSaveable { mutableStateOf("") }
    LaunchedEffect(Unit) { model.loadRecurring() }
    FinanceListPage(resources.getString(R.string.recurring_payments), onBack) {
        item("controls") {
            Button(onClick = create) { Text(resources.getString(R.string.add_recurring_payment)) }
            TextField(resources.getString(R.string.search), search, onChange = { search = it })
            ChoiceField(
                resources.getString(R.string.view),
                view,
                listOf(
                    "upcoming" to resources.getString(R.string.upcoming_30_days),
                    "all" to resources.getString(R.string.all_recurring_payments),
                ),
            ) {
                view = it
            }
            ChoiceField(
                resources.getString(R.string.type),
                type,
                listOf("" to resources.getString(R.string.all)) + paymentOptions,
            ) {
                type = it
            }
        }
        remoteItems(state, model::loadRecurring) { list ->
            val visible =
                list.filter {
                    it.name.contains(search, true) && (type.isEmpty() || it.type == type)
                }
            item("summary") {
                FinanceCard {
                    Text(
                        resources.getString(R.string.monthly_estimates),
                        style = MaterialTheme.typography.titleLarge,
                    )
                    visible
                        .groupBy { it.currency }
                        .toSortedMap()
                        .forEach { (currency, entries) ->
                            Text(resources.getString(R.string.payments))
                            MoneyLabel(
                                -entries
                                    .filter { it.type != "regular_income" }
                                    .fold(BigDecimal.ZERO) { sum, entry ->
                                        sum + monthlyEquivalent(entry)
                                    },
                                currency,
                            )
                            Text(resources.getString(R.string.income))
                            MoneyLabel(
                                entries
                                    .filter { it.type == "regular_income" }
                                    .fold(BigDecimal.ZERO) { sum, entry ->
                                        sum + monthlyEquivalent(entry)
                                    },
                                currency,
                            )
                        }
                }
            }
            if (view == "upcoming") {
                val upcoming =
                    upcomingPayments(visible, LocalDate.now(), LocalDate.now().plusDays(29))
                if (upcoming.isEmpty())
                    item("no-upcoming") {
                        Text(resources.getString(R.string.no_payments_due_in_the_next_30_days))
                    }
                if (visible.any { it.startDate == null })
                    item("no-start-dates") {
                        Text(
                            resources.getString(
                                R.string
                                    .add_start_dates_to_include_undated_items_in_upcoming_payments
                            )
                        )
                    }
                items(upcoming, key = { "occurrence:${it.payment.id}:${it.date}" }) { occurrence ->
                    FinanceCard {
                        DateLabel(occurrence.date.toString())
                        Text(occurrence.payment.name)
                        MoneyLabel(occurrence.payment.displayAmount(), occurrence.payment.currency)
                        TextButton(onClick = { open(occurrence.payment.id) }) {
                            Text(resources.getString(R.string.view_recurring_payment))
                        }
                    }
                }
            }
            if (visible.isEmpty())
                item("empty") { Text(resources.getString(R.string.no_recurring_payments_found)) }
            if (view == "all")
                items(
                    visible.sortedWith(
                        compareBy<RecurringPayment> { nextPaymentDate(it) ?: LocalDate.MAX }
                            .thenBy { it.name }
                    ),
                    key = { "recurring:${it.id}" },
                ) { payment ->
                    FinanceCard {
                        Text(payment.name, style = MaterialTheme.typography.titleLarge)
                        MoneyLabel(payment.displayAmount(), payment.currency)
                        Text(
                            "${paymentOptions.find { it.first == payment.type }?.second ?: payment.type} · ${cadenceOptions.find { it.first == payment.cadence }?.second ?: payment.cadence}"
                        )
                        nextPaymentDate(payment)?.let {
                            Text(
                                resources.getString(
                                    R.string.next_value,
                                    formatPreferenceDate(it.toString(), LocalDateFormat.current),
                                )
                            )
                        } ?: Text(resources.getString(R.string.no_start_date))
                        TextButton(onClick = { open(payment.id) }) {
                            Text(resources.getString(R.string.view_recurring_payment))
                        }
                    }
                }
        }
    }
}

@Composable
fun RecurringDetails(id: String, model: FinanceViewModel, onBack: () -> Unit, edit: () -> Unit) {
    val resources = androidx.compose.ui.platform.LocalResources.current
    val cadenceOptions = cadenceLabels.map { it.first to resources.getString(it.second) }
    val paymentOptions = paymentLabels.map { it.first to resources.getString(it.second) }

    val state by model.recurring.state.collectAsStateWithLifecycle()
    val mutation by model.mutation.collectAsStateWithLifecycle()
    var deleting by remember { mutableStateOf(false) }
    LaunchedEffect(id) {
        model.clearMutation()
        model.loadRecurring()
    }
    LaunchedEffect(mutation.completed) {
        if (mutation.completed) {
            model.clearMutation()
            onBack()
        }
    }
    FinancePage(resources.getString(R.string.recurring_payment), onBack) {
        RemoteContent(state, model::loadRecurring) { list ->
            val item = list.find { it.id == id }
            if (item == null)
                Text(resources.getString(R.string.this_recurring_payment_is_no_longer_available))
            else
                FinanceCard {
                    Text(item.name, style = MaterialTheme.typography.headlineMedium)
                    MoneyLabel(item.displayAmount(), item.currency)
                    Text(cadenceOptions.find { it.first == item.cadence }?.second ?: item.cadence)
                    item.startDate?.let {
                        Text(
                            resources.getString(
                                R.string.starts_value,
                                formatPreferenceDate(
                                    it.take(10).toString(),
                                    LocalDateFormat.current,
                                ),
                            )
                        )
                    }
                    nextPaymentDate(item)?.let {
                        Text(
                            resources.getString(
                                R.string.next_payment_value,
                                formatPreferenceDate(it.toString(), LocalDateFormat.current),
                            )
                        )
                    }
                    Row {
                        TextButton(enabled = !mutation.busy, onClick = edit) {
                            Text(resources.getString(R.string.edit))
                        }
                        TextButton(enabled = !mutation.busy, onClick = { deleting = true }) {
                            Text(resources.getString(R.string.action_delete))
                        }
                    }
                }
        }
        MutationFeedback(mutation)
    }
    if (deleting)
        ConfirmDelete(
            resources.getString(R.string.delete_recurring_payment),
            mutation.busy,
            { deleting = false },
        ) {
            model.mutate { model.repository.deleteRecurring(id) }
        }
}

@Composable
fun RecurringFormScreen(
    id: String?,
    model: FinanceViewModel,
    defaultCurrency: String,
    onBack: () -> Unit,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current
    val cadenceOptions = cadenceLabels.map { it.first to resources.getString(it.second) }
    val paymentOptions = paymentLabels.map { it.first to resources.getString(it.second) }

    val state by model.recurring.state.collectAsStateWithLifecycle()
    val categories by model.categories.state.collectAsStateWithLifecycle()
    val mutation by model.mutation.collectAsStateWithLifecycle()
    LaunchedEffect(id) {
        model.clearMutation()
        model.loadCategories()
        if (id != null) model.loadRecurring()
    }
    LaunchedEffect(mutation.completed) {
        if (mutation.completed) {
            model.clearMutation()
            onBack()
        }
    }
    val item = state.value?.find { it.id == id }
    if (id != null && (item == null)) {
        FinancePage(resources.getString(R.string.recurring_payment), onBack) {
            RemoteContent(state, model::loadRecurring) {}
            if (!state.loading && state.value != null)
                Text(resources.getString(R.string.this_recurring_payment_is_no_longer_available))
        }
        return
    }
    key(id) {
        var name by rememberSaveable { mutableStateOf(item?.name.orEmpty()) }
        var amount by rememberSaveable { mutableStateOf(item?.amount?.toPlainString().orEmpty()) }
        var currency by rememberSaveable { mutableStateOf(item?.currency ?: defaultCurrency) }
        var cadence by rememberSaveable { mutableStateOf(item?.cadence ?: "monthly") }
        var type by rememberSaveable { mutableStateOf(item?.type ?: "subscription") }
        var date by rememberSaveable { mutableStateOf(item?.startDate?.take(10).orEmpty()) }
        var category by rememberSaveable { mutableStateOf(item?.categoryId.orEmpty()) }
        var image by rememberSaveable { mutableStateOf(item?.imageUrl.orEmpty()) }
        var error by remember { mutableStateOf<String?>(null) }
        val initial = remember {
            listOf(
                item?.name.orEmpty(),
                item?.amount?.toPlainString().orEmpty(),
                item?.currency ?: defaultCurrency,
                item?.cadence ?: "monthly",
                item?.type ?: "subscription",
                item?.startDate?.take(10).orEmpty(),
                item?.categoryId.orEmpty(),
                item?.imageUrl.orEmpty(),
            )
        }
        val back =
            rememberFormBackHandler(
                initial != listOf(name, amount, currency, cadence, type, date, category, image),
                mutation.busy,
                onBack,
            )
        FinancePage(
            if (id == null) resources.getString(R.string.add_recurring_payment)
            else resources.getString(R.string.edit_recurring_payment),
            back,
        ) {
            TextField(
                resources.getString(R.string.name),
                name,
                !mutation.busy,
                onChange = {
                    name = it
                    error = null
                },
            )
            ChoiceField(resources.getString(R.string.type), type, paymentOptions, !mutation.busy) {
                type = it
            }
            ChoiceField(
                resources.getString(R.string.frequency),
                cadence,
                cadenceOptions,
                !mutation.busy,
            ) {
                cadence = it
            }
            ChoiceField(
                resources.getString(R.string.currency),
                currency,
                Currency.supported.map { it.code to it.code },
                !mutation.busy,
            ) {
                currency = it
            }
            TextField(
                resources.getString(R.string.amount),
                amount,
                !mutation.busy,
                KeyboardType.Decimal,
                onChange = {
                    amount = it
                    error = null
                },
            )
            TextField(
                resources.getString(R.string.start_date_yyyy_mm_dd_optional),
                date,
                !mutation.busy,
                onChange = {
                    date = it
                    error = null
                },
            )
            RemoteContent(categories, model::loadCategories) { options ->
                ChoiceField(
                    resources.getString(R.string.category),
                    category,
                    listOf("" to resources.getString(R.string.none)) +
                        options.map { it.id to it.name },
                    !mutation.busy,
                ) {
                    category = it
                }
            }
            TextField(
                resources.getString(R.string.image_url_https_optional),
                image,
                !mutation.busy,
                onChange = { image = it },
            )
            error?.let { ErrorNotice(it) }
            MutationFeedback(mutation)
            Button(
                enabled = !mutation.busy,
                onClick = {
                    try {
                        require(name.isNotBlank()) { resources.getString(R.string.enter_a_name) }
                        val money = Money.parse(amount, currency)
                        require(money.amount.signum() > 0) {
                            resources.getString(R.string.enter_an_amount_above_zero)
                        }
                        if (date.isNotBlank()) LocalDate.parse(date)
                        require(image.isBlank() || java.net.URI(image).scheme == "https") {
                            resources.getString(R.string.use_an_https_image_url)
                        }
                        val input =
                            RecurringInput(
                                name.trim(),
                                money.amount,
                                currency,
                                cadence,
                                type,
                                date.ifBlank { null },
                                category.ifBlank { null },
                                image.ifBlank { null },
                            )
                        model.mutate {
                            if (id == null) model.repository.createRecurring(input)
                            else model.repository.updateRecurring(id, input)
                        }
                    } catch (failure: Exception) {
                        error =
                            failure.userMessage(resources)
                                ?: resources.getString(R.string.check_the_recurring_payment_details)
                    }
                },
            ) {
                Text(resources.getString(R.string.save_recurring_payment))
            }
            TextButton(enabled = !mutation.busy, onClick = back) {
                Text(resources.getString(R.string.cancel))
            }
        }
    }
}
