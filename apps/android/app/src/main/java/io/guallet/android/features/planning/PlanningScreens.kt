package io.guallet.android.features.planning

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.guallet.android.core.money.*
import io.guallet.android.features.budgets.domain.*
import io.guallet.android.features.finance.presentation.FinanceViewModel
import io.guallet.android.features.goals.domain.*
import io.guallet.android.features.recurring.domain.*
import io.guallet.android.features.transactions.presentation.TransactionCard
import io.guallet.android.features.transactions.presentation.transactionDate
import io.guallet.android.ui.components.*
import java.math.BigDecimal
import java.time.LocalDate

val cadenceOptions =
    listOf(
        "weekly" to "Weekly",
        "biweekly" to "Every two weeks",
        "monthly" to "Monthly",
        "quarterly" to "Quarterly",
        "yearly" to "Yearly",
    )
val paymentOptions =
    listOf(
        "subscription" to "Subscription",
        "regular_payment" to "Payment",
        "regular_income" to "Income",
    )

@Composable
fun BudgetsScreen(model: FinanceViewModel, open: (String) -> Unit, create: () -> Unit) {
    val state by model.budgets.state.collectAsStateWithLifecycle()
    LaunchedEffect(Unit) { model.loadBudgets() }
    FinancePage("Budgets") {
        Row {
            TextButton(onClick = { model.loadBudgets(model.month.minusMonths(1)) }) {
                Text("Previous month")
            }
            TextButton(onClick = { model.loadBudgets(model.month.plusMonths(1)) }) {
                Text("Next month")
            }
        }
        Text(model.month.toString(), style = MaterialTheme.typography.titleLarge)
        Button(onClick = create) { Text("Add budget") }
        RemoteContent(state, { model.loadBudgets() }) { budgets ->
            if (budgets.isEmpty()) Text("No budgets yet.")
            budgets
                .groupBy { it.currency }
                .forEach { (currency, group) ->
                    FinanceCard {
                        Text("${currency} monthly budget total")
                        MoneyLabel(
                            group.fold(BigDecimal.ZERO) { total, item -> total + item.amount },
                            currency,
                        )
                        Text("Spent")
                        MoneyLabel(
                            group.fold(BigDecimal.ZERO) { total, item -> total + item.spent },
                            currency,
                        )
                    }
                }
            budgets.forEach { budget ->
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
                    TextButton(onClick = { open(budget.id) }) { Text("View budget") }
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
) {
    val state by model.budgets.state.collectAsStateWithLifecycle()
    val transactions by model.budgetTransactions.state.collectAsStateWithLifecycle()
    val mutation by model.mutation.collectAsStateWithLifecycle()
    var deleting by remember { mutableStateOf(false) }
    LaunchedEffect(id) {
        model.clearMutation()
        model.loadBudgets()
        model.loadBudgetTransactions(id)
    }
    LaunchedEffect(mutation.completed) {
        if (mutation.completed) {
            model.clearMutation()
            onBack()
        }
    }
    FinancePage("Budget", onBack) {
        RemoteContent(state, { model.loadBudgets() }) { list ->
            val budget = list.find { it.id == id }
            if (budget == null) Text("This budget is no longer available.")
            else
                FinanceCard {
                    CategorySymbol(budget.icon, budget.colour)
                    Text(budget.name, style = MaterialTheme.typography.titleLarge)
                    Text("Budget for ${model.month}")
                    MoneyLabel(budget.amount, budget.currency)
                    Text("Spent")
                    MoneyLabel(budget.spent, budget.currency)
                    Text("Remaining")
                    MoneyLabel(budget.amount - budget.spent, budget.currency)
                    Row {
                        TextButton(enabled = !mutation.busy, onClick = edit) { Text("Edit") }
                        TextButton(enabled = !mutation.busy, onClick = { deleting = true }) {
                            Text("Delete")
                        }
                    }
                }
        }
        MutationFeedback(mutation)
        Text("Transactions", style = MaterialTheme.typography.titleLarge)
        RemoteContent(
            transactions.copy(
                value =
                    transactions.value.takeIf { transactions.requestKey == listOf(id, model.month) }
            ),
            { model.loadBudgetTransactions(id) },
        ) { list ->
            if (list.isEmpty()) Text("No transactions for this budget this month.")
            list.forEach { item -> TransactionCard(item, { transaction(item.id) }) }
        }
    }
    if (deleting)
        ConfirmDelete("Delete budget?", mutation.busy, { deleting = false }) {
            model.mutate { model.repository.deleteBudgets(id) }
        }
}

@Composable
fun BudgetFormScreen(
    id: String?,
    model: FinanceViewModel,
    defaultCurrency: String,
    onBack: () -> Unit,
) {
    val budgets by model.budgets.state.collectAsStateWithLifecycle()
    val accounts by model.accounts.state.collectAsStateWithLifecycle()
    val categories by model.categories.state.collectAsStateWithLifecycle()
    val mutation by model.mutation.collectAsStateWithLifecycle()
    LaunchedEffect(id) {
        model.clearMutation()
        model.loadAccounts()
        model.loadCategories()
        if (id != null) model.loadBudgets()
    }
    LaunchedEffect(mutation.completed) {
        if (mutation.completed) {
            model.clearMutation()
            onBack()
        }
    }
    val item = budgets.value?.find { it.id == id }
    if (
        (id != null && (budgets.loading || budgets.error != null || item == null)) ||
            accounts.value == null ||
            categories.value == null
    ) {
        FinancePage("Budget", onBack) {
            RemoteContent(budgets, { model.loadBudgets() }) {}
            RemoteContent(accounts, model::loadAccounts) {}
            RemoteContent(categories, model::loadCategories) {}
            if (id != null && !budgets.loading && budgets.value != null && item == null)
                Text("This budget is no longer available.")
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
            listOf(name, currency, amount, selected.joinToString(), colour, icon)
        }
        val back =
            rememberFormBackHandler(
                initial != listOf(name, currency, amount, selected.joinToString(), colour, icon),
                mutation.busy,
                onBack,
            )
        FinancePage(if (id == null) "Add budget" else "Edit budget", back) {
            TextField(
                "Name",
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
            ChoiceField("Currency", currency, currencies.map { it to it }, !mutation.busy) {
                currency = it
            }
            TextField(
                "Monthly amount",
                amount,
                !mutation.busy,
                KeyboardType.Decimal,
                onChange = {
                    amount = it
                    error = null
                },
            )
            TextField("Colour (#RRGGBB)", colour, !mutation.busy, onChange = { colour = it })
            IconChoiceField(icon, !mutation.busy) { icon = it }
            MultiChoice(
                "Categories",
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
                            "Enter a name with at least two characters."
                        }
                        require(currency in currencies) { "Choose a currency used by an account." }
                        val money = Money.parse(amount, currency)
                        require(money.amount.signum() > 0 && selected.isNotEmpty()) {
                            "Enter an amount above zero and select at least one category."
                        }
                        require(Regex("#[0-9a-fA-F]{6}").matches(colour)) {
                            "Enter a six-digit hex colour."
                        }
                        val input =
                            BudgetInput(name.trim(), money.amount, currency, selected, colour, icon)
                        model.mutate {
                            if (id == null) model.repository.createBudgets(input)
                            else model.repository.updateBudgets(id, input)
                        }
                    } catch (failure: IllegalArgumentException) {
                        error = failure.message
                    }
                },
            ) {
                Text("Save budget")
            }
            TextButton(enabled = !mutation.busy, onClick = back) { Text("Cancel") }
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
    val goals by model.goals.state.collectAsStateWithLifecycle()
    val accounts by model.accounts.state.collectAsStateWithLifecycle()
    LaunchedEffect(Unit) {
        model.loadGoals()
        model.loadAccounts()
    }
    FinancePage("Savings goals", onBack) {
        Button(onClick = create) { Text("Add savings goal") }
        RemoteContent(goals, model::loadGoals) { list ->
            if (list.isEmpty()) Text("No savings goals yet.")
            list
                .sortedByDescending { it.priority ?: 0 }
                .forEach { goal ->
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
                            Text("Target")
                            MoneyLabel(goal.targetAmount, currencies.single())
                        } else Text("Select accounts with one currency to display goal amounts.")
                        LinearProgressIndicator(
                            progress = {
                                (goal.progressPercentage / 100).toFloat().coerceIn(0f, 1f)
                            },
                            modifier = Modifier.fillMaxWidth(),
                        )
                        if (goal.isCompleted) Text("Complete")
                        else if (goal.isOverdue) Text("Overdue")
                        TextButton(onClick = { open(goal.id) }) { Text("View goal") }
                    }
                }
        }
    }
}

@Composable
fun GoalDetails(id: String, model: FinanceViewModel, onBack: () -> Unit, edit: () -> Unit) {
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
    FinancePage("Savings goal", onBack) {
        RemoteContent(goals, model::loadGoals) { list ->
            val goal = list.find { it.id == id }
            if (goal == null) Text("This goal is no longer available.")
            else
                FinanceCard {
                    Text(goal.name, style = MaterialTheme.typography.headlineMedium)
                    goal.description?.let { Text(it) }
                    val linked = accounts.value.orEmpty().filter { it.id in goal.accounts }
                    val currency = linked.map { it.currency }.distinct().singleOrNull()
                    if (currency != null) {
                        Text("Saved")
                        MoneyLabel(goal.currentAmount, currency)
                        Text("Target")
                        MoneyLabel(goal.targetAmount, currency)
                        Text("Remaining")
                        MoneyLabel(goal.remainingAmount, currency)
                    } else Text("Goal currency unavailable. Mixed currencies are not converted.")
                    goal.targetDate?.let { Text("Target date: ${it.take(10)}") }
                    if (goal.isCompleted) Text("Complete") else if (goal.isOverdue) Text("Overdue")
                    linked.forEach { Text(it.name) }
                    Row {
                        TextButton(onClick = edit, enabled = !mutation.busy) { Text("Edit") }
                        TextButton(enabled = !mutation.busy, onClick = { deleting = true }) {
                            Text("Delete")
                        }
                    }
                }
        }
        MutationFeedback(mutation)
    }
    if (deleting)
        ConfirmDelete("Delete savings goal?", mutation.busy, { deleting = false }) {
            model.mutate { model.repository.deleteGoals(id) }
        }
}

@Composable
fun GoalFormScreen(id: String?, model: FinanceViewModel, onBack: () -> Unit) {
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
    if (
        accounts.value == null ||
            (id != null && (goals.loading || goals.error != null || item == null))
    ) {
        FinancePage("Savings goal", onBack) {
            RemoteContent(accounts, model::loadAccounts) {}
            RemoteContent(goals, model::loadGoals) {}
            if (id != null && !goals.loading && goals.value != null && item == null)
                Text("This goal is no longer available.")
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
            listOf(name, description, amount, selected.joinToString(), date, priority)
        }
        val back =
            rememberFormBackHandler(
                initial !=
                    listOf(name, description, amount, selected.joinToString(), date, priority),
                mutation.busy,
                onBack,
            )
        FinancePage(if (id == null) "Add savings goal" else "Edit savings goal", back) {
            TextField(
                "Name",
                name,
                !mutation.busy,
                onChange = {
                    name = it
                    error = null
                },
            )
            TextField(
                "Description",
                description,
                !mutation.busy,
                multiline = true,
                onChange = { description = it },
            )
            MultiChoice(
                "Linked accounts",
                selected.toSet(),
                accounts.value.orEmpty().map { it.id to "${it.name} (${it.currency})" },
                !mutation.busy,
            ) {
                selected = it.toList()
            }
            TextField(
                "Target amount",
                amount,
                !mutation.busy,
                KeyboardType.Decimal,
                onChange = {
                    amount = it
                    error = null
                },
            )
            TextField(
                "Target date (YYYY-MM-DD, optional)",
                date,
                !mutation.busy,
                onChange = {
                    date = it
                    error = null
                },
            )
            TextField(
                "Priority",
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
                        require(name.isNotBlank()) { "Enter a goal name." }
                        val available = accounts.value.orEmpty().filter { it.id in selected }
                        require(available.isNotEmpty()) { "Select at least one available account." }
                        val currency = available.map { it.currency }.distinct().singleOrNull()
                        require(currency != null) {
                            "Choose accounts with the same currency. Currency conversion is not available."
                        }
                        val money = Money.parse(amount, currency)
                        require(money.amount.signum() > 0) { "Enter an amount above zero." }
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
                        error = failure.message ?: "Check the goal details."
                    }
                },
            ) {
                Text("Save goal")
            }
            TextButton(enabled = !mutation.busy, onClick = back) { Text("Cancel") }
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
    val state by model.recurring.state.collectAsStateWithLifecycle()
    var search by rememberSaveable { mutableStateOf("") }
    var view by rememberSaveable { mutableStateOf("upcoming") }
    var type by rememberSaveable { mutableStateOf("") }
    LaunchedEffect(Unit) { model.loadRecurring() }
    FinancePage("Recurring payments", onBack) {
        Button(onClick = create) { Text("Add recurring payment") }
        TextField("Search", search, onChange = { search = it })
        ChoiceField(
            "View",
            view,
            listOf("upcoming" to "Upcoming 30 days", "all" to "All recurring payments"),
        ) {
            view = it
        }
        ChoiceField("Type", type, listOf("" to "All") + paymentOptions) { type = it }
        RemoteContent(state, model::loadRecurring) { list ->
            val visible =
                list.filter {
                    it.name.contains(search, true) && (type.isEmpty() || it.type == type)
                }
            FinanceCard {
                Text("Monthly estimates", style = MaterialTheme.typography.titleLarge)
                visible
                    .groupBy { it.currency }
                    .toSortedMap()
                    .forEach { (currency, entries) ->
                        Text("Payments")
                        MoneyLabel(
                            -entries
                                .filter { it.type != "regular_income" }
                                .fold(BigDecimal.ZERO) { sum, entry ->
                                    sum + monthlyEquivalent(entry)
                                },
                            currency,
                        )
                        Text("Income")
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
            if (view == "upcoming") {
                val upcoming =
                    upcomingPayments(visible, LocalDate.now(), LocalDate.now().plusDays(29))
                if (upcoming.isEmpty()) Text("No payments due in the next 30 days.")
                if (visible.any { it.startDate == null })
                    Text("Add start dates to include undated items in upcoming payments.")
                upcoming.forEach { occurrence ->
                    FinanceCard {
                        DateLabel(occurrence.date.toString())
                        Text(occurrence.payment.name)
                        MoneyLabel(
                            if (occurrence.payment.type == "regular_income")
                                occurrence.payment.amount
                            else -occurrence.payment.amount,
                            occurrence.payment.currency,
                        )
                        TextButton(onClick = { open(occurrence.payment.id) }) {
                            Text("View recurring payment")
                        }
                    }
                }
            }
            if (visible.isEmpty()) Text("No recurring payments found.")
            if (view == "all")
                visible
                    .sortedWith(
                        compareBy<RecurringPayment> { nextPaymentDate(it) ?: LocalDate.MAX }
                            .thenBy { it.name }
                    )
                    .forEach { payment ->
                        FinanceCard {
                            Text(payment.name, style = MaterialTheme.typography.titleLarge)
                            MoneyLabel(payment.amount, payment.currency)
                            Text(
                                "${paymentOptions.find { it.first == payment.type }?.second ?: payment.type} · ${cadenceOptions.find { it.first == payment.cadence }?.second ?: payment.cadence}"
                            )
                            nextPaymentDate(payment)?.let { Text("Next: $it") }
                                ?: Text("No start date")
                            TextButton(onClick = { open(payment.id) }) {
                                Text("View recurring payment")
                            }
                        }
                    }
        }
    }
}

@Composable
fun RecurringDetails(id: String, model: FinanceViewModel, onBack: () -> Unit, edit: () -> Unit) {
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
    FinancePage("Recurring payment", onBack) {
        RemoteContent(state, model::loadRecurring) { list ->
            val item = list.find { it.id == id }
            if (item == null) Text("This recurring payment is no longer available.")
            else
                FinanceCard {
                    Text(item.name, style = MaterialTheme.typography.headlineMedium)
                    MoneyLabel(item.amount, item.currency)
                    Text(cadenceOptions.find { it.first == item.cadence }?.second ?: item.cadence)
                    item.startDate?.let { Text("Starts: ${it.take(10)}") }
                    nextPaymentDate(item)?.let { Text("Next payment: $it") }
                    Row {
                        TextButton(enabled = !mutation.busy, onClick = edit) { Text("Edit") }
                        TextButton(enabled = !mutation.busy, onClick = { deleting = true }) {
                            Text("Delete")
                        }
                    }
                }
        }
        MutationFeedback(mutation)
    }
    if (deleting)
        ConfirmDelete("Delete recurring payment?", mutation.busy, { deleting = false }) {
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
    if (id != null && (state.loading || state.error != null || item == null)) {
        FinancePage("Recurring payment", onBack) {
            RemoteContent(state, model::loadRecurring) {}
            if (!state.loading && state.value != null && item == null)
                Text("This recurring payment is no longer available.")
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
            listOf(name, amount, currency, cadence, type, date, category, image)
        }
        val back =
            rememberFormBackHandler(
                initial != listOf(name, amount, currency, cadence, type, date, category, image),
                mutation.busy,
                onBack,
            )
        FinancePage(if (id == null) "Add recurring payment" else "Edit recurring payment", back) {
            TextField(
                "Name",
                name,
                !mutation.busy,
                onChange = {
                    name = it
                    error = null
                },
            )
            ChoiceField("Type", type, paymentOptions, !mutation.busy) { type = it }
            ChoiceField("Frequency", cadence, cadenceOptions, !mutation.busy) { cadence = it }
            ChoiceField(
                "Currency",
                currency,
                Currency.supported.map { it.code to it.code },
                !mutation.busy,
            ) {
                currency = it
            }
            TextField(
                "Amount",
                amount,
                !mutation.busy,
                KeyboardType.Decimal,
                onChange = {
                    amount = it
                    error = null
                },
            )
            TextField(
                "Start date (YYYY-MM-DD, optional)",
                date,
                !mutation.busy,
                onChange = {
                    date = it
                    error = null
                },
            )
            RemoteContent(categories, model::loadCategories) { options ->
                ChoiceField(
                    "Category",
                    category,
                    listOf("" to "None") + options.map { it.id to it.name },
                    !mutation.busy,
                ) {
                    category = it
                }
            }
            TextField(
                "Image URL (HTTPS, optional)",
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
                        require(name.isNotBlank()) { "Enter a name." }
                        val money = Money.parse(amount, currency)
                        require(money.amount.signum() > 0) { "Enter an amount above zero." }
                        if (date.isNotBlank()) LocalDate.parse(date)
                        require(image.isBlank() || java.net.URI(image).scheme == "https") {
                            "Use an HTTPS image URL."
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
                        error = failure.message ?: "Check the recurring payment details."
                    }
                },
            ) {
                Text("Save recurring payment")
            }
            TextButton(enabled = !mutation.busy, onClick = back) { Text("Cancel") }
        }
    }
}
