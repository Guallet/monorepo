package io.guallet.android.features.accounts.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.guallet.android.core.money.Currency
import io.guallet.android.core.money.Money
import io.guallet.android.features.accounts.domain.*
import io.guallet.android.ui.components.*

@Composable
fun AccountsScreen(model: AccountsViewModel, open: (String) -> Unit, create: () -> Unit) {
    val state by model.state.collectAsStateWithLifecycle()
    var query by rememberSaveable { mutableStateOf("") }
    LaunchedEffect(Unit) { model.refresh() }
    FinancePage("Accounts") {
        Row {
            Button(onClick = create) { Text("Add account") }
            TextButton(onClick = model::refresh) { Text("Refresh") }
        }
        if (state.loading) LinearProgressIndicator(Modifier.fillMaxWidth())
        state.listError?.let { ErrorNotice(it, model::refresh) }
        if (!state.loading && state.listError == null && state.accounts.isEmpty())
            Text("No accounts yet. Add your first account to start tracking your money.")
        if (state.accounts.isNotEmpty()) {
            FinanceCard {
                Text("Total balance by currency", style = MaterialTheme.typography.titleLarge)
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
                    Text("Some balances are unavailable and excluded from totals.")
            }
            TextField("Search accounts", query, onChange = { query = it })
            val filtered = state.accounts.filter { it.name.contains(query, ignoreCase = true) }
            if (filtered.isEmpty()) Text("No matching accounts.")
            AccountType.entries.forEach { type ->
                val group =
                    filtered.filter { it.accountType == type }.sortedBy { it.name.lowercase() }
                if (group.isNotEmpty()) {
                    Text(type.label, style = MaterialTheme.typography.titleLarge)
                    group.forEach { account ->
                        FinanceCard {
                            Text(account.name, style = MaterialTheme.typography.titleLarge)
                            account.balance?.let { MoneyLabel(it.amount, it.currency) }
                                ?: Text("Balance unavailable")
                            TextButton(onClick = { open(account.id) }) { Text("View account") }
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
    FinancePage("Account", onBack) {
        if (state.detailsLoading) LinearProgressIndicator(Modifier.fillMaxWidth())
        state.detailsError?.let { ErrorNotice(it) { model.loadDetails(id) } }
        state.selected
            ?.takeIf { it.id == id }
            ?.let { account ->
                FinanceCard {
                    Text(account.name, style = MaterialTheme.typography.headlineMedium)
                    Text("${account.accountType.label} · ${account.currency}")
                    account.balance?.let { MoneyLabel(it.amount, it.currency) }
                        ?: Text("Balance unavailable")
                    Text(
                        when (account.source) {
                            "synced" -> "Synced${account.sourceName?.let { " with $it" }.orEmpty()}"
                            "imported" -> "Imported"
                            else -> "Manual account"
                        }
                    )
                    Row {
                        TextButton(enabled = !state.saving, onClick = edit) { Text("Edit") }
                        TextButton(enabled = !state.saving, onClick = { deleting = true }) {
                            Text("Delete")
                        }
                    }
                    TextButton(onClick = chart) { Text("Balance history") }
                }
                if (state.saving) LinearProgressIndicator(Modifier.fillMaxWidth())
                state.mutationError?.let { ErrorNotice(it) }
                Text("Transactions this month", style = MaterialTheme.typography.titleLarge)
                if (state.transactionsLoading) LinearProgressIndicator(Modifier.fillMaxWidth())
                state.transactionsError?.let { ErrorNotice(it) { model.loadTransactions(id) } }
                if (
                    !state.transactionsLoading &&
                        state.transactionsError == null &&
                        state.transactions.isEmpty()
                )
                    Text("No transactions this month.")
                state.transactions.forEach { transaction ->
                    FinanceCard {
                        Text(transaction.description)
                        MoneyLabel(transaction.amount, transaction.currency)
                        DateLabel(transaction.date)
                        TextButton(onClick = { openTransaction(transaction.id) }) {
                            Text("View transaction")
                        }
                    }
                }
            }
    }
    if (deleting)
        ConfirmDelete("Delete this account?", state.saving, { deleting = false }) {
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
        FinancePage("Edit account", onBack) {
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
    requestError: String?,
    defaultCurrency: String,
    onBack: () -> Unit,
    onSave: (AccountInput) -> Unit,
) {
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
    FinancePage(if (account == null) "Add manual account" else "Edit account", back) {
        TextField(
            "Account name",
            name,
            !busy,
            onChange = {
                name = it
                error = null
            },
        )
        ChoiceField("Account type", type, AccountType.entries.map { it.wire to it.label }, !busy) {
            type = it
        }
        ChoiceField(
            "Currency",
            currency,
            Currency.supported.map { it.code to "${it.code} — ${it.name}" },
            !busy,
        ) {
            currency = it
        }
        if (account != null && currency != account.currency)
            Text("Changing currency relabels the balance. It does not convert the amount.")
        TextField(
            "Current balance",
            balance,
            !busy,
            KeyboardType.Decimal,
            onChange = {
                balance = it
                error = null
            },
        )
        Text("Use a negative value for money you owe.")
        Row {
            Checkbox(record, enabled = !busy, onCheckedChange = { record = it })
            Text(
                if (account == null) "Record starting balance as a transaction"
                else "Record balance change as a transaction"
            )
        }
        if (busy) LinearProgressIndicator(Modifier.fillMaxWidth())
        error?.let { ErrorNotice(it) }
        requestError?.let { ErrorNotice(it) }
        Button(
            enabled = !busy,
            onClick = {
                try {
                    require(name.isNotBlank()) { "Enter an account name." }
                    val amount = Money.parse(balance, currency).amount
                    onSave(AccountInput(name.trim(), type, currency, amount, record))
                } catch (failure: IllegalArgumentException) {
                    error = failure.message
                }
            },
        ) {
            Text("Save account")
        }
        TextButton(enabled = !busy, onClick = back) { Text("Cancel") }
    }
}
