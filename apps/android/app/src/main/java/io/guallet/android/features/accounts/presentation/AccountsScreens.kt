package io.guallet.android.features.accounts.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.guallet.android.R
import io.guallet.android.core.money.Currency
import io.guallet.android.core.money.Money
import io.guallet.android.core.state.*
import io.guallet.android.features.accounts.domain.*
import io.guallet.android.ui.components.*

@Composable
fun AccountsScreen(model: AccountsViewModel, open: (String) -> Unit, create: () -> Unit) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val state by model.state.collectAsStateWithLifecycle()
    var query by rememberSaveable { mutableStateOf("") }
    LaunchedEffect(Unit) { model.refresh() }
    FinanceListPage(resources.getString(R.string.accounts)) {
        item("controls") {
            Column(
                verticalArrangement =
                    Arrangement.spacedBy(io.guallet.android.ui.theme.GualletTokens.gutter)
            ) {
                Row {
                    Button(onClick = create) { Text(resources.getString(R.string.add_account)) }
                    TextButton(onClick = model::refresh) {
                        Text(resources.getString(R.string.refresh))
                    }
                }
                if (state.loading) LinearProgressIndicator(Modifier.fillMaxWidth())
                state.listError?.let { ErrorNotice(it, model::refresh) }
                if (!state.loading && state.listError == null && state.accounts.isEmpty())
                    Text(
                        resources.getString(
                            R.string
                                .no_accounts_yet_add_your_first_account_to_start_tracking_your_money
                        )
                    )
                if (state.accounts.isNotEmpty()) {
                    FinanceCard {
                        Text(
                            resources.getString(R.string.total_balance_by_currency),
                            style = MaterialTheme.typography.titleLarge,
                        )
                        state.accounts
                            .filter { it.balance != null }
                            .groupBy { it.balance!!.currency }
                            .toSortedMap()
                            .forEach { (currency, accounts) ->
                                MoneyLabel(
                                    accounts.fold(java.math.BigDecimal.ZERO) { total, account ->
                                        total + account.balance!!.amount
                                    },
                                    currency,
                                )
                            }
                        if (state.accounts.any { it.balance == null })
                            Text(
                                resources.getString(
                                    R.string.some_balances_are_unavailable_and_excluded_from_totals
                                )
                            )
                    }
                    TextField(
                        resources.getString(R.string.search_accounts),
                        query,
                        onChange = { query = it },
                    )
                }
            }
        }
        val filtered = state.accounts.filter { it.name.contains(query, ignoreCase = true) }
        if (filtered.isEmpty() && state.accounts.isNotEmpty())
            item("empty") { Text(resources.getString(R.string.no_matching_accounts)) }
        AccountType.entries.forEach { type ->
            val group = filtered.filter { it.accountType == type }.sortedBy { it.name.lowercase() }
            if (group.isNotEmpty()) {
                item("type:${type.wire}") {
                    Text(
                        type.localizedLabel(resources),
                        style = MaterialTheme.typography.titleLarge,
                    )
                }
                items(group, key = { "account:${it.id}" }) { account ->
                    FinanceCard {
                        Text(account.name, style = MaterialTheme.typography.titleLarge)
                        account.balance?.let { MoneyLabel(it.amount, it.currency) }
                            ?: Text(resources.getString(R.string.balance_unavailable))
                        TextButton(onClick = { open(account.id) }) {
                            Text(resources.getString(R.string.view_account))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AccountDetailsScreen(
    id: String,
    model: AccountsViewModel,
    onBack: () -> Unit,
    edit: () -> Unit,
    openTransaction: (String) -> Unit,
    chart: () -> Unit,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val state by model.state.collectAsStateWithLifecycle()
    var deleting by remember { mutableStateOf(false) }
    LaunchedEffect(id) {
        model.loadDetails(id)
        model.clearMutation()
    }
    LaunchedEffect(state.deleted) {
        if (state.deleted) {
            model.clearMutation()
            onBack()
        }
    }
    FinanceListPage(resources.getString(R.string.account), onBack) {
        item("status") {
            Column {
                if (state.detailsLoading) LinearProgressIndicator(Modifier.fillMaxWidth())
                state.detailsError?.let { ErrorNotice(it) { model.loadDetails(id) } }
            }
        }
        state.selected
            ?.takeIf { it.id == id }
            ?.let { account ->
                item("account") {
                    FinanceCard {
                        Text(account.name, style = MaterialTheme.typography.headlineMedium)
                        Text(
                            "${account.accountType.localizedLabel(resources)} · ${account.currency}"
                        )
                        account.balance?.let { MoneyLabel(it.amount, it.currency) }
                            ?: Text(resources.getString(R.string.balance_unavailable))
                        Text(
                            when (account.source) {
                                "synced" ->
                                    resources.getString(
                                        R.string.syncedvalue,
                                        account.sourceName
                                            ?.let { resources.getString(R.string.sync_source, it) }
                                            .orEmpty(),
                                    )
                                "imported" -> resources.getString(R.string.imported)
                                else -> resources.getString(R.string.manual_account)
                            }
                        )
                        Row {
                            TextButton(enabled = !state.saving, onClick = edit) {
                                Text(resources.getString(R.string.edit))
                            }
                            TextButton(enabled = !state.saving, onClick = { deleting = true }) {
                                Text(resources.getString(R.string.action_delete))
                            }
                        }
                        TextButton(onClick = chart) {
                            Text(resources.getString(R.string.balance_history))
                        }
                    }
                }
                item("transaction-status") {
                    Column {
                        if (state.saving) LinearProgressIndicator(Modifier.fillMaxWidth())
                        state.mutationError?.let { ErrorNotice(it) }
                        Text(
                            resources.getString(R.string.transactions_this_month),
                            style = MaterialTheme.typography.titleLarge,
                        )
                        if (state.transactionsLoading)
                            LinearProgressIndicator(Modifier.fillMaxWidth())
                        state.transactionsError?.let {
                            ErrorNotice(it) { model.loadTransactions(id) }
                        }
                        if (
                            !state.transactionsLoading &&
                                state.transactionsError == null &&
                                state.transactions.isEmpty()
                        )
                            Text(resources.getString(R.string.no_transactions_this_month))
                    }
                }
                items(state.transactions, key = { "transaction:${it.id}" }) { transaction ->
                    FinanceCard {
                        Text(transaction.description)
                        MoneyLabel(transaction.amount, transaction.currency)
                        DateLabel(transaction.date)
                        TextButton(onClick = { openTransaction(transaction.id) }) {
                            Text(resources.getString(R.string.view_transaction))
                        }
                    }
                }
            }
    }
    if (deleting)
        ConfirmDelete(
            resources.getString(R.string.delete_this_account),
            state.saving,
            { deleting = false },
        ) {
            model.delete(id)
        }
}

@Composable
fun AccountFormScreen(
    id: String?,
    model: AccountsViewModel,
    defaultCurrency: String,
    onBack: () -> Unit,
    onSaved: (String) -> Unit,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val state by model.state.collectAsStateWithLifecycle()
    LaunchedEffect(id) {
        model.clearMutation()
        if (id != null) model.loadDetails(id)
    }
    LaunchedEffect(state.savedId) {
        state.savedId?.let {
            model.clearMutation()
            onSaved(it)
        }
    }
    if (id != null && state.selected?.id != id) {
        FinancePage(resources.getString(R.string.edit_account), onBack) {
            if (state.detailsLoading) CircularProgressIndicator()
            state.detailsError?.let { ErrorNotice(it) { model.loadDetails(id) } }
        }
        return
    }
    val account = if (id == null) null else state.selected
    key(id) {
        AccountEditor(account, state.saving, state.mutationError, defaultCurrency, onBack) { input
            ->
            model.save(id, input)
        }
    }
}

@Composable
private fun AccountEditor(
    account: Account?,
    busy: Boolean,
    requestError: UiMessage?,
    defaultCurrency: String,
    onBack: () -> Unit,
    onSave: (AccountInput) -> Unit,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    var name by rememberSaveable { mutableStateOf(account?.name.orEmpty()) }
    var currency by rememberSaveable { mutableStateOf(account?.currency ?: defaultCurrency) }
    var type by rememberSaveable { mutableStateOf(account?.type ?: AccountType.Current.wire) }
    var balance by rememberSaveable {
        mutableStateOf(account?.balance?.amount?.toPlainString() ?: "0")
    }
    var record by rememberSaveable { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val dirty =
        name != account?.name.orEmpty() ||
            currency != (account?.currency ?: defaultCurrency) ||
            type != (account?.type ?: AccountType.Current.wire) ||
            balance != (account?.balance?.amount?.toPlainString() ?: "0") ||
            !record
    val back = rememberFormBackHandler(dirty, busy, onBack)
    FinancePage(
        if (account == null) resources.getString(R.string.add_manual_account)
        else resources.getString(R.string.edit_account),
        back,
    ) {
        TextField(
            resources.getString(R.string.account_name),
            name,
            !busy,
            onChange = {
                name = it
                error = null
            },
        )
        ChoiceField(
            resources.getString(R.string.account_type),
            type,
            AccountType.entries.map { it.wire to it.localizedLabel(resources) },
            !busy,
        ) {
            type = it
        }
        ChoiceField(
            resources.getString(R.string.currency),
            currency,
            Currency.supported.map { it.code to "${it.code} — ${it.name}" },
            !busy,
        ) {
            currency = it
            if (account != null && it != account.currency) record = false
        }
        if (account != null && currency != account.currency)
            Text(
                resources.getString(
                    R.string.changing_currency_relabels_the_balance_it_does_not_convert_the_amount
                )
            )
        TextField(
            resources.getString(R.string.current_balance),
            balance,
            !busy,
            KeyboardType.Decimal,
            onChange = {
                balance = it
                error = null
            },
        )
        Text(resources.getString(R.string.use_a_negative_value_for_money_you_owe))
        LabelledCheckbox(
            if (account == null)
                resources.getString(R.string.record_starting_balance_as_a_transaction)
            else resources.getString(R.string.record_balance_change_as_a_transaction),
            record,
            !busy && (account == null || currency == account.currency),
        ) {
            record = it
        }
        if (busy) LinearProgressIndicator(Modifier.fillMaxWidth())
        error?.let { ErrorNotice(it) }
        requestError?.let { ErrorNotice(it) }
        Button(
            enabled = !busy,
            onClick = {
                try {
                    require(name.isNotBlank()) {
                        resources.getString(R.string.enter_an_account_name)
                    }
                    val amount = Money.parse(balance, currency).amount
                    onSave(AccountInput(name.trim(), type, currency, amount, record))
                } catch (failure: IllegalArgumentException) {
                    error = failure.userMessage(resources)
                }
            },
        ) {
            Text(resources.getString(R.string.save_account))
        }
        TextButton(enabled = !busy, onClick = back) { Text(resources.getString(R.string.cancel)) }
    }
}

private fun AccountType.localizedLabel(resources: android.content.res.Resources): String =
    resources.getString(
        when (this) {
            AccountType.Current -> R.string.account_type_current
            AccountType.CreditCard -> R.string.account_type_creditcard
            AccountType.Savings -> R.string.account_type_savings
            AccountType.Investment -> R.string.account_type_investment
            AccountType.Mortgage -> R.string.account_type_mortgage
            AccountType.Loan -> R.string.account_type_loan
            AccountType.Pension -> R.string.account_type_pension
            AccountType.Unknown -> R.string.account_type_unknown
        }
    )
