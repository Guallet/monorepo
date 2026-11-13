package io.guallet.android.features.transactions.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.Saver
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.text.input.KeyboardType
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.guallet.android.R
import io.guallet.android.core.money.Currency
import io.guallet.android.core.money.Money
import io.guallet.android.core.network.apiJson
import io.guallet.android.core.state.*
import io.guallet.android.features.finance.presentation.*
import io.guallet.android.features.transactions.domain.*
import io.guallet.android.ui.components.*
import java.time.LocalDate
import java.time.ZoneOffset
import kotlinx.serialization.encodeToString

fun transactionDate(value: String, end: Boolean = false): String {
    val date = LocalDate.parse(value)
    return (if (end) date.plusDays(1).atStartOfDay().minusNanos(1) else date.atStartOfDay())
        .toInstant(ZoneOffset.UTC)
        .toString()
}

private val transactionFilterSaver =
    Saver<TransactionFilter, String>(
        save = { apiJson.encodeToString(it) },
        restore = {
            runCatching { apiJson.decodeFromString<TransactionFilter>(it) }
                .getOrDefault(TransactionFilter())
        },
    )

@Composable
fun TransactionsScreen(model: FinanceViewModel, open: (String) -> Unit, create: () -> Unit) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val state by model.transactions.state.collectAsStateWithLifecycle()
    val accounts by model.accounts.state.collectAsStateWithLifecycle()
    val categories by model.categories.state.collectAsStateWithLifecycle()
    var applied by
        rememberSaveable(stateSaver = transactionFilterSaver) {
            mutableStateOf(model.transactionFilter)
        }
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
        model.loadTransactions(applied)
        model.loadAccounts()
        model.loadCategories()
    }
    FinanceListPage(resources.getString(R.string.transactions)) {
        item("controls") {
            Column {
                Row {
                    TextButton(onClick = { filters = !filters }) {
                        Text(resources.getString(R.string.filters))
                    }
                    TextButton(onClick = { model.loadTransactions() }) {
                        Text(resources.getString(R.string.refresh))
                    }
                    TextButton(onClick = create) { Text(resources.getString(R.string.add)) }
                }
                if (filters)
                    FinanceCard {
                        RemoteContent(accounts, model::loadAccounts) { list ->
                            MultiChoice(
                                resources.getString(R.string.accounts),
                                selectedAccounts.toSet(),
                                list.map { it.id to it.name },
                            ) {
                                selectedAccounts = it.toList()
                            }
                        }
                        RemoteContent(categories, model::loadCategories) { list ->
                            MultiChoice(
                                resources.getString(R.string.categories),
                                selectedCategories.toSet(),
                                list.map { it.id to it.name },
                            ) {
                                selectedCategories = it.toList()
                            }
                        }
                        TextField(
                            resources.getString(R.string.start_date_yyyy_mm_dd),
                            start,
                            onChange = {
                                start = it
                                error = null
                            },
                        )
                        TextField(
                            resources.getString(R.string.end_date_yyyy_mm_dd),
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
                                    val from =
                                        start
                                            .takeIf { it.isNotBlank() }
                                            ?.let { transactionDate(it) }
                                    val to =
                                        end.takeIf { it.isNotBlank() }
                                            ?.let { transactionDate(it, true) }
                                    require(from == null || to == null || from <= to) {
                                        resources.getString(
                                            R.string.choose_an_end_date_on_or_after_the_start_date
                                        )
                                    }
                                    applied =
                                        TransactionFilter(
                                            accounts =
                                                selectedAccounts.joinToString(",").ifBlank { null },
                                            categories =
                                                selectedCategories.joinToString(",").ifBlank {
                                                    null
                                                },
                                            startDate = from,
                                            endDate = to,
                                        )
                                    model.loadTransactions(applied)
                                    filters = false
                                } catch (_: Exception) {
                                    error =
                                        resources.getString(
                                            R.string
                                                .enter_valid_dates_and_an_end_date_on_or_after_the_start_date
                                        )
                                }
                            }
                        ) {
                            Text(resources.getString(R.string.apply_filters))
                        }
                        TextButton(
                            onClick = {
                                selectedAccounts = emptyList()
                                selectedCategories = emptyList()
                                start = ""
                                end = ""
                                applied = TransactionFilter()
                                model.loadTransactions(applied)
                                filters = false
                            }
                        ) {
                            Text(resources.getString(R.string.clear_filters))
                        }
                    }
                TextField(
                    resources.getString(R.string.search_this_page),
                    query,
                    onChange = { query = it },
                )
            }
        }
        remoteItems(state, { model.loadTransactions(applied) }) { page ->
            item("page-summary") {
                Text(
                    resources.getString(
                        R.string.transactions_page,
                        resources.getQuantityString(
                            R.plurals.transaction_count,
                            page.meta.total,
                            page.meta.total,
                        ),
                        page.meta.page,
                    )
                )
            }
            val visible =
                page.transactions.filter { it.description.contains(query, ignoreCase = true) }
            if (visible.isEmpty())
                item("empty") { Text(resources.getString(R.string.no_transactions_found)) }
            items(visible, key = { "transaction:${it.id}" }) { transaction ->
                TransactionCard(
                    transaction,
                    { open(transaction.id) },
                    accounts.value.orEmpty().find { it.id == transaction.accountId }?.name,
                )
            }
            item("pagination") {
                Row {
                    TextButton(
                        enabled = !state.loading && page.meta.page > 1,
                        onClick = {
                            applied = applied.copy(page = page.meta.page - 1)
                            model.loadTransactions(applied)
                        },
                    ) {
                        Text(resources.getString(R.string.previous_page))
                    }
                    TextButton(
                        enabled = !state.loading && page.meta.hasMore,
                        onClick = {
                            applied = applied.copy(page = page.meta.page + 1)
                            model.loadTransactions(applied)
                        },
                    ) {
                        Text(resources.getString(R.string.next_page))
                    }
                }
            }
        }
    }
}

@Composable
fun TransactionCard(transaction: Transaction, onOpen: () -> Unit, account: String? = null) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    FinanceCard {
        Text(transaction.description, style = MaterialTheme.typography.titleLarge)
        MoneyLabel(transaction.amount, transaction.currency)
        Text(
            listOfNotNull(formatPreferenceDate(transaction.date, LocalDateFormat.current), account)
                .joinToString(" · ")
        )
        TextButton(onClick = onOpen) { Text(resources.getString(R.string.view_transaction)) }
    }
}

@Composable
fun TransactionScreen(
    id: String?,
    model: FinanceViewModel,
    defaultCurrency: String,
    onBack: () -> Unit,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current

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
    if (id != null && (state.value?.id != id)) {
        FinancePage(resources.getString(R.string.transaction), onBack) {
            RemoteContent(state, { model.loadTransaction(id) }) {}
        }
        return
    }
    if (accounts.value == null || categories.value == null) {
        FinancePage(resources.getString(R.string.transaction), onBack) {
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
    val resources = androidx.compose.ui.platform.LocalResources.current

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
        listOf(
            transaction?.description.orEmpty(),
            transaction?.amount?.abs()?.toPlainString().orEmpty(),
            (transaction?.amount?.signum() == 1).toString(),
            transaction?.accountId ?: accounts.value.orEmpty().firstOrNull()?.id.orEmpty(),
            transaction?.currency
                ?: accounts.value.orEmpty().firstOrNull()?.currency
                ?: defaultCurrency,
            transaction?.date?.take(10) ?: LocalDate.now().toString(),
            transaction?.notes.orEmpty(),
            transaction?.categoryId.orEmpty(),
        )
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
    val remote by model.transaction.state.collectAsStateWithLifecycle()
    FinancePage(
        if (transaction == null) resources.getString(R.string.add_transaction)
        else resources.getString(R.string.edit_transaction),
        back,
    ) {
        if (transaction != null) {
            if (remote.loading) LinearProgressIndicator()
            remote.error?.let { ErrorNotice(it) { model.loadTransaction(transaction.id) } }
        }
        TextField(
            resources.getString(R.string.description),
            description,
            !mutation.busy,
            onChange = {
                description = it
                error = null
            },
        )
        ChoiceField(
            resources.getString(R.string.type),
            if (income) "income" else "expense",
            listOf(
                "expense" to resources.getString(R.string.expense),
                "income" to resources.getString(R.string.income),
            ),
            !mutation.busy,
        ) {
            income = it == "income"
        }
        ChoiceField(
            resources.getString(R.string.account),
            accountId,
            accounts.value.orEmpty().map { it.id to it.name },
            !mutation.busy,
        ) {
            accountId = it
            currency = accounts.value.orEmpty().find { item -> item.id == it }?.currency ?: currency
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
            resources.getString(R.string.date_yyyy_mm_dd),
            date,
            !mutation.busy,
            onChange = {
                date = it
                error = null
            },
        )
        ChoiceField(
            resources.getString(R.string.category),
            categoryId,
            listOf("" to resources.getString(R.string.uncategorised)) +
                categories.value.orEmpty().map { it.id to it.name },
            !mutation.busy,
        ) {
            categoryId = it
        }
        TextField(
            resources.getString(R.string.notes),
            notes,
            !mutation.busy,
            multiline = true,
            onChange = { notes = it },
        )
        error?.let { ErrorNotice(it) }
        MutationFeedback(mutation)
        Button(
            enabled = !mutation.busy,
            onClick = {
                try {
                    require(description.isNotBlank() && accountId.isNotBlank()) {
                        resources.getString(R.string.enter_a_description_and_choose_an_account)
                    }
                    val money = Money.parse(amount, currency)
                    require(money.amount.signum() > 0) {
                        resources.getString(R.string.enter_an_amount_above_zero)
                    }
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
                        if (failure is IllegalArgumentException) failure.userMessage(resources)
                        else resources.getString(R.string.enter_a_valid_date)
                }
            },
        ) {
            Text(resources.getString(R.string.save_transaction))
        }
        if (transaction != null)
            TextButton(enabled = !mutation.busy, onClick = { deleting = true }) {
                Text(resources.getString(R.string.delete_transaction))
            }
        TextButton(enabled = !mutation.busy, onClick = back) {
            Text(resources.getString(R.string.cancel))
        }
    }
    if (deleting && transaction != null)
        ConfirmDelete(
            resources.getString(R.string.delete_transaction_a61cf3),
            mutation.busy,
            { deleting = false },
        ) {
            model.mutate { model.repository.deleteTransaction(transaction.id) }
        }
}
