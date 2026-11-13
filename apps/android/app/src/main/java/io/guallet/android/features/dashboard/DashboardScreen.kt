package io.guallet.android.features.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.guallet.android.R
import io.guallet.android.features.finance.presentation.FinanceViewModel
import io.guallet.android.features.notifications.presentation.notificationRoute
import io.guallet.android.features.transactions.presentation.TransactionCard
import io.guallet.android.ui.components.*
import java.math.BigDecimal
import java.time.LocalDate

@Composable
fun DashboardScreen(model: FinanceViewModel, name: String, navigate: (String) -> Unit) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val accounts by model.accounts.state.collectAsStateWithLifecycle()
    val cashflow by model.cashflow.state.collectAsStateWithLifecycle()
    val recent by model.recent.state.collectAsStateWithLifecycle()
    val goals by model.goals.state.collectAsStateWithLifecycle()
    val notifications by model.notifications.state.collectAsStateWithLifecycle()
    LaunchedEffect(Unit) { model.dashboard() }
    FinancePage(resources.getString(R.string.hi_value, name.substringBefore(' '))) {
        DateLabel(LocalDate.now().toString())
        Row {
            TextButton(onClick = { model.dashboard() }) {
                Text(resources.getString(R.string.refresh))
            }
            TextButton(onClick = { navigate("notifications") }) {
                Text(
                    resources.getString(
                        R.string.notifications_value,
                        notifications.value.orEmpty().count { !it.isRead },
                    )
                )
            }
        }
        FinanceCard {
            Text(
                resources.getString(R.string.total_wealth),
                style = MaterialTheme.typography.titleLarge,
            )
            RemoteContent(accounts, model::loadAccounts) { list ->
                if (list.isEmpty())
                    Text(resources.getString(R.string.add_an_account_to_see_your_balances))
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
                if (list.any { it.balance == null })
                    Text(resources.getString(R.string.unavailable_balances_are_excluded))
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
                        TextButton(onClick = { navigate(route) }) {
                            Text(resources.getString(R.string.open))
                        }
                    }
                }
            }
        FinanceCard {
            Text(
                resources.getString(R.string.cashflow_last_30_days),
                style = MaterialTheme.typography.titleLarge,
            )
            RemoteContent(cashflow, model::loadCashflow) { list ->
                if (list.isEmpty())
                    Text(resources.getString(R.string.no_transactions_in_this_period))
                list
                    .groupBy { it.currency }
                    .toSortedMap()
                    .forEach { (currency, items) ->
                        Text(resources.getString(R.string.income))
                        MoneyLabel(
                            items
                                .filter { it.amount.signum() > 0 }
                                .fold(BigDecimal.ZERO) { sum, item -> sum + item.amount },
                            currency,
                        )
                        Text(resources.getString(R.string.expenses))
                        MoneyLabel(
                            items
                                .filter { it.amount.signum() < 0 }
                                .fold(BigDecimal.ZERO) { sum, item -> sum + item.amount },
                            currency,
                        )
                        Text(resources.getString(R.string.net))
                        MoneyLabel(
                            items.fold(BigDecimal.ZERO) { sum, item -> sum + item.amount },
                            currency,
                        )
                    }
            }
        }
        Text(
            resources.getString(R.string.recent_transactions),
            style = MaterialTheme.typography.titleLarge,
        )
        RemoteContent(recent, model::loadRecent) { page ->
            if (page.transactions.isEmpty()) Text(resources.getString(R.string.no_transactions_yet))
            page.transactions.take(5).forEach { transaction ->
                TransactionCard(transaction, { navigate("transactions/${transaction.id}") })
            }
        }
        TextButton(onClick = { navigate("transactions") }) {
            Text(resources.getString(R.string.see_all_transactions))
        }
        Text(
            resources.getString(R.string.savings_goals),
            style = MaterialTheme.typography.titleLarge,
        )
        RemoteContent(goals, model::loadGoals) { list ->
            if (list.isEmpty()) Text(resources.getString(R.string.no_savings_goals_yet))
            list.take(3).forEach { goal ->
                FinanceCard {
                    Text(goal.name)
                    LinearProgressIndicator(
                        progress = { (goal.progressPercentage / 100).toFloat().coerceIn(0f, 1f) }
                    )
                    TextButton(onClick = { navigate("goals/${goal.id}") }) {
                        Text(resources.getString(R.string.view_goal))
                    }
                }
            }
        }
        TextButton(onClick = { navigate("goals") }) {
            Text(resources.getString(R.string.see_all_savings_goals))
        }
    }
}
