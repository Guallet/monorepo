package io.guallet.android.features.transactions.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.text.input.KeyboardType
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.guallet.android.core.money.Currency
import io.guallet.android.core.money.Money
import io.guallet.android.features.finance.presentation.*
import io.guallet.android.features.transactions.domain.*
import io.guallet.android.ui.components.*
import java.time.LocalDate
import java.time.ZoneOffset

fun transactionDate(value: String, end: Boolean = false): String {
    val date = LocalDate.parse(value)
    return (if (end) date.plusDays(1).atStartOfDay().minusNanos(1) else date.atStartOfDay())
        .toInstant(ZoneOffset.UTC)
        .toString()
}

@Composable
fun TransactionsScreen(model: FinanceViewModel, open: (String) -> Unit, create: () -> Unit) {
    val state by model.transactions.state.collectAsStateWithLifecycle()
    val accounts by model.accounts.state.collectAsStateWithLifecycle()
    val categories by model.categories.state.collectAsStateWithLifecycle()
    var filters by rememberSaveable { mutableStateOf(false) }
    var selectedAccounts by rememberSaveable {
        mutableStateOf(model.transactionFilter.accounts?.split(',').orEmpty())
    }
    var selectedCategories by rememberSaveable {
        mutableStateOf(model.transactionFilter.categories?.split(',').orEmpty())
    }
    var start by rememberSaveable {
        mutableStateOf(model.transactionFilter.startDate?.take(10).orEmpty())
    }
    var end by rememberSaveable {
        mutableStateOf(model.transactionFilter.endDate?.take(10).orEmpty())
    }
    var error by remember { mutableStateOf<String?>(null) }
    var query by rememberSaveable { mutableStateOf("") }
    LaunchedEffect(Unit) {
        model.loadTransactions()
        model.loadAccounts()
        model.loadCategories()
    }
    FinancePage("Transactions") {
        Row {
            TextButton(onClick = { filters = !filters }) { Text("Filters") }
            TextButton(onClick = { model.loadTransactions() }) { Text("Refresh") }
            TextButton(onClick = create) { Text("Add") }
        }
        if (filters)
            FinanceCard {
                RemoteContent(accounts, model::loadAccounts) { list ->
                    MultiChoice(
                        "Accounts",
                        selectedAccounts.toSet(),
                        list.map { it.id to it.name },
                    ) {
                        selectedAccounts = it.toList()
                    }
                }
                RemoteContent(categories, model::loadCategories) { list ->
                    MultiChoice(
                        "Categories",
                        selectedCategories.toSet(),
                        list.map { it.id to it.name },
                    ) {
                        selectedCategories = it.toList()
                    }
                }
                TextField(
                    "Start date (YYYY-MM-DD)",
                    start,
                    onChange = {
                        start = it
                        error = null
                    },
                )
                TextField(
                    "End date (YYYY-MM-DD)",
                    end,
                    onChange = {
                        end = it
                        error = null
                    },
                )
                error?.let { ErrorNotice(it) }
                Button(
                    onClick = {
                        try {
                            val from = start.takeIf { it.isNotBlank() }?.let { transactionDate(it) }
                            val to =
                                end.takeIf { it.isNotBlank() }?.let { transactionDate(it, true) }
                            require(from == null || to == null || from <= to) {
                                "Choose an end date on or after the start date."
                            }
                            model.loadTransactions(
                                TransactionFilter(
                                    accounts = selectedAccounts.joinToString(",").ifBlank { null },
                                    categories =
                                        selectedCategories.joinToString(",").ifBlank { null },
                                    startDate = from,
                                    endDate = to,
                                )
                            )
                            filters = false
                        } catch (_: Exception) {
                            error = "Enter valid dates and an end date on or after the start date."
                        }
                    }
                ) {
                    Text("Apply filters")
                }
                TextButton(
                    onClick = {
                        selectedAccounts = emptyList()
                        selectedCategories = emptyList()
                        start = ""
                        end = ""
                        model.loadTransactions(TransactionFilter())
                        filters = false
                    }
                ) {
                    Text("Clear filters")
                }
            }
        TextField("Search this page", query, onChange = { query = it })
        RemoteContent(state, { model.loadTransactions() }) { page ->
            Text("${page.meta.total} transactions · Page ${page.meta.page}")
            val visible =
                page.transactions.filter { it.description.contains(query, ignoreCase = true) }
            if (visible.isEmpty()) Text("No transactions found.")
            visible.forEach { transaction ->
                TransactionCard(
                    transaction,
                    { open(transaction.id) },
                    accounts.value.orEmpty().find { it.id == transaction.accountId }?.name,
                )
            }
            Row {
                TextButton(
                    enabled = !state.loading && page.meta.page > 1,
                    onClick = {
                        model.loadTransactions(
                            model.transactionFilter.copy(page = page.meta.page - 1)
                        )
                    },
                ) {
                    Text("Previous page")
                }
                TextButton(
                    enabled = !state.loading && page.meta.hasMore,
                    onClick = {
                        model.loadTransactions(
                            model.transactionFilter.copy(page = page.meta.page + 1)
                        )
                    },
                ) {
                    Text("Next page")
                }
            }
        }
    }
}

@Composable
fun TransactionCard(transaction: Transaction, onOpen: () -> Unit, account: String? = null) {
    FinanceCard {
        Text(transaction.description, style = MaterialTheme.typography.titleLarge)
        MoneyLabel(transaction.amount, transaction.currency)
        Text(
            listOfNotNull(formatPreferenceDate(transaction.date, LocalDateFormat.current), account)
                .joinToString(" · ")
        )
        TextButton(onClick = onOpen) { Text("View transaction") }
    }
}

@Composable
fun TransactionScreen(
    id: String?,
    model: FinanceViewModel,
    defaultCurrency: String,
    onBack: () -> Unit,
) {
    val state by model.transaction.state.collectAsStateWithLifecycle()
    val accounts by model.accounts.state.collectAsStateWithLifecycle()
    val categories by model.categories.state.collectAsStateWithLifecycle()
    val mutation by model.mutation.collectAsStateWithLifecycle()
    LaunchedEffect(id) {
        model.clearMutation()
        if (id != null) model.loadTransaction(id)
        model.loadAccounts()
        model.loadCategories()
    }
    LaunchedEffect(mutation.completed) {
        if (mutation.completed) {
            model.clearMutation()
            onBack()
        }
    }
    if (id != null && (state.loading || state.error != null || state.value?.id != id)) {
        FinancePage("Transaction", onBack) {
            RemoteContent(state, { model.loadTransaction(id) }) {}
        }
        return
    }
    if (accounts.value == null || categories.value == null) {
        FinancePage("Transaction", onBack) {
            RemoteContent(accounts, model::loadAccounts) {}
            RemoteContent(categories, model::loadCategories) {}
        }
        return
    }
    val transaction = if (id == null) null else state.value
    key(id) { TransactionEditor(transaction, model, defaultCurrency, onBack) }
}

@Composable
private fun TransactionEditor(
    transaction: Transaction?,
    model: FinanceViewModel,
    defaultCurrency: String,
    onBack: () -> Unit,
) {
    val accounts by model.accounts.state.collectAsStateWithLifecycle()
    val categories by model.categories.state.collectAsStateWithLifecycle()
    val mutation by model.mutation.collectAsStateWithLifecycle()
    var description by rememberSaveable { mutableStateOf(transaction?.description.orEmpty()) }
    var amount by rememberSaveable {
        mutableStateOf(transaction?.amount?.abs()?.toPlainString().orEmpty())
    }
    var income by rememberSaveable { mutableStateOf(transaction?.amount?.signum() == 1) }
    var accountId by rememberSaveable {
        mutableStateOf(
            transaction?.accountId ?: accounts.value.orEmpty().firstOrNull()?.id.orEmpty()
        )
    }
    var currency by rememberSaveable {
        mutableStateOf(
            transaction?.currency
                ?: accounts.value.orEmpty().find { it.id == accountId }?.currency
                ?: defaultCurrency
        )
    }
    var date by rememberSaveable {
        mutableStateOf(transaction?.date?.take(10) ?: LocalDate.now().toString())
    }
    var notes by rememberSaveable { mutableStateOf(transaction?.notes.orEmpty()) }
    var categoryId by rememberSaveable { mutableStateOf(transaction?.categoryId.orEmpty()) }
    var error by remember { mutableStateOf<String?>(null) }
    var deleting by remember { mutableStateOf(false) }
    val baseline = remember {
        listOf(description, amount, income.toString(), accountId, currency, date, notes, categoryId)
    }
    val dirty =
        baseline !=
            listOf(
                description,
                amount,
                income.toString(),
                accountId,
                currency,
                date,
                notes,
                categoryId,
            )
    val back = rememberFormBackHandler(dirty, mutation.busy, onBack)
    FinancePage(if (transaction == null) "Add transaction" else "Edit transaction", back) {
        TextField(
            "Description",
            description,
            !mutation.busy,
            onChange = {
                description = it
                error = null
            },
        )
        ChoiceField(
            "Type",
            if (income) "income" else "expense",
            listOf("expense" to "Expense", "income" to "Income"),
            !mutation.busy,
        ) {
            income = it == "income"
        }
        ChoiceField(
            "Account",
            accountId,
            accounts.value.orEmpty().map { it.id to it.name },
            !mutation.busy,
        ) {
            accountId = it
            currency = accounts.value.orEmpty().find { item -> item.id == it }?.currency ?: currency
        }
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
            "Date (YYYY-MM-DD)",
            date,
            !mutation.busy,
            onChange = {
                date = it
                error = null
            },
        )
        ChoiceField(
            "Category",
            categoryId,
            listOf("" to "Uncategorised") + categories.value.orEmpty().map { it.id to it.name },
            !mutation.busy,
        ) {
            categoryId = it
        }
        TextField("Notes", notes, !mutation.busy, multiline = true, onChange = { notes = it })
        error?.let { ErrorNotice(it) }
        MutationFeedback(mutation)
        Button(
            enabled = !mutation.busy,
            onClick = {
                try {
                    require(description.isNotBlank() && accountId.isNotBlank()) {
                        "Enter a description and choose an account."
                    }
                    val money = Money.parse(amount, currency)
                    require(money.amount.signum() > 0) { "Enter an amount above zero." }
                    val input =
                        TransactionInput(
                            accountId,
                            description.trim(),
                            if (income) money.amount else -money.amount,
                            currency,
                            transactionDate(date),
                            notes.ifBlank { null },
                            categoryId.ifBlank { null },
                        )
                    model.mutate {
                        if (transaction == null) model.repository.createTransaction(input)
                        else model.repository.updateTransaction(transaction.id, input)
                    }
                } catch (failure: Exception) {
                    error =
                        if (failure is IllegalArgumentException) failure.message
                        else "Enter a valid date."
                }
            },
        ) {
            Text("Save transaction")
        }
        if (transaction != null)
            TextButton(enabled = !mutation.busy, onClick = { deleting = true }) {
                Text("Delete transaction")
            }
        TextButton(enabled = !mutation.busy, onClick = back) { Text("Cancel") }
    }
    if (deleting && transaction != null)
        ConfirmDelete("Delete transaction?", mutation.busy, { deleting = false }) {
            model.mutate { model.repository.deleteTransaction(transaction.id) }
        }
}
