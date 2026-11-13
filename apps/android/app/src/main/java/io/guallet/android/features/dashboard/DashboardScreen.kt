package io.guallet.android.features.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.guallet.android.features.finance.presentation.FinanceViewModel
import io.guallet.android.features.notifications.presentation.notificationRoute
import io.guallet.android.features.transactions.presentation.TransactionCard
import io.guallet.android.ui.components.*
import java.math.BigDecimal
import java.time.LocalDate

@Composable
fun DashboardScreen(model: FinanceViewModel, name: String, navigate: (String) -> Unit) {
    val accounts by model.accounts.state.collectAsStateWithLifecycle()
    val cashflow by model.cashflow.state.collectAsStateWithLifecycle()
    val recent by model.recent.state.collectAsStateWithLifecycle()
    val goals by model.goals.state.collectAsStateWithLifecycle()
    val notifications by model.notifications.state.collectAsStateWithLifecycle()
    LaunchedEffect(Unit) { model.dashboard() }
    FinancePage("Hi, ${name.substringBefore(' ')}") {
        Text(LocalDate.now().toString())
        Row {
            TextButton(onClick = { model.dashboard() }) { Text("Refresh") }
            TextButton(onClick = { navigate("notifications") }) {
                Text("Notifications (${notifications.value.orEmpty().count { !it.isRead }})")
            }
        }
        FinanceCard {
            Text("Total wealth", style = MaterialTheme.typography.titleLarge)
            RemoteContent(accounts, model::loadAccounts) { list ->
                if (list.isEmpty()) Text("Add an account to see your balances.")
                list
                    .filter { it.balance != null }
                    .groupBy { it.balance!!.currency }
                    .toSortedMap()
                    .forEach { (currency, items) ->
                        MoneyLabel(
                            items.fold(BigDecimal.ZERO) { sum, item ->
                                sum + item.balance!!.amount
                            },
                            currency,
                        )
                    }
                if (list.any { it.balance == null }) Text("Unavailable balances are excluded.")
            }
        }
        notifications.value
            .orEmpty()
            .filter { !it.isRead }
            .take(3)
            .forEach { item ->
                FinanceCard {
                    Text(item.message)
                    notificationRoute(item.action)?.let { route ->
                        TextButton(onClick = { navigate(route) }) { Text("Open") }
                    }
                }
            }
        FinanceCard {
            Text("Cashflow · Last 30 days", style = MaterialTheme.typography.titleLarge)
            RemoteContent(cashflow, model::loadCashflow) { list ->
                if (list.isEmpty()) Text("No transactions in this period.")
                list
                    .groupBy { it.currency }
                    .toSortedMap()
                    .forEach { (currency, items) ->
                        Text("Income")
                        MoneyLabel(
                            items
                                .filter { it.amount.signum() > 0 }
                                .fold(BigDecimal.ZERO) { sum, item -> sum + item.amount },
                            currency,
                        )
                        Text("Expenses")
                        MoneyLabel(
                            items
                                .filter { it.amount.signum() < 0 }
                                .fold(BigDecimal.ZERO) { sum, item -> sum + item.amount },
                            currency,
                        )
                        Text("Net")
                        MoneyLabel(
                            items.fold(BigDecimal.ZERO) { sum, item -> sum + item.amount },
                            currency,
                        )
                    }
            }
        }
        Text("Recent transactions", style = MaterialTheme.typography.titleLarge)
        RemoteContent(recent, model::loadRecent) { page ->
            if (page.transactions.isEmpty()) Text("No transactions yet.")
            page.transactions.take(5).forEach { transaction ->
                TransactionCard(transaction, { navigate("transactions/${transaction.id}") })
            }
        }
        TextButton(onClick = { navigate("transactions") }) { Text("See all transactions") }
        Text("Savings goals", style = MaterialTheme.typography.titleLarge)
        RemoteContent(goals, model::loadGoals) { list ->
            if (list.isEmpty()) Text("No savings goals yet.")
            list.take(3).forEach { goal ->
                FinanceCard {
                    Text(goal.name)
                    LinearProgressIndicator(
                        progress = { (goal.progressPercentage / 100).toFloat().coerceIn(0f, 1f) }
                    )
                    TextButton(onClick = { navigate("goals/${goal.id}") }) { Text("View goal") }
                }
            }
        }
        TextButton(onClick = { navigate("goals") }) { Text("See all savings goals") }
    }
}
