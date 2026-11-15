package io.guallet.android.features.accounts.presentation

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.guallet.android.R
import io.guallet.android.features.finance.presentation.FinanceViewModel
import io.guallet.android.ui.components.*
import io.guallet.android.ui.theme.GualletTokens

@Composable
fun AccountChartScreen(
    id: String,
    accounts: AccountsViewModel,
    model: FinanceViewModel,
    onBack: () -> Unit,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val state by model.accountChart.state.collectAsStateWithLifecycle()
    val selected by accounts.state.collectAsStateWithLifecycle()
    LaunchedEffect(id) {
        model.loadAccountChart(id)
        accounts.loadDetails(id)
    }
    FinanceListPage(resources.getString(R.string.balance_history_last_90_days), onBack) {
        remoteItems(
            state.copy(value = state.value.takeIf { state.requestKey == id }),
            { model.loadAccountChart(id) },
        ) { chart ->
            if (chart.balanceHistory.isEmpty())
                item("empty") { Text(resources.getString(R.string.no_balance_history_yet)) }
            val points = chart.balanceHistory.sortedBy { it.date }
            if (points.size > 1)
                item("chart") {
                    Canvas(
                        Modifier.fillMaxWidth().height(GualletTokens.chartHeight).semantics {
                            contentDescription =
                                resources.getString(
                                    R.string.balance_history_chart_daily_balances_are_listed_below
                                )
                        }
                    ) {
                        val values = points.map { it.balance.toDouble() }
                        val low = values.min()
                        val high = values.max()
                        val range = (high - low).takeIf { it > 0 } ?: 1.0
                        points.indices.drop(1).forEach { index ->
                            fun position(i: Int) =
                                Offset(
                                    size.width * i / (points.size - 1),
                                    (size.height * (1 - (values[i] - low) / range)).toFloat(),
                                )
                            drawLine(
                                GualletTokens.primary,
                                position(index - 1),
                                position(index),
                                strokeWidth = 3f,
                            )
                        }
                    }
                }
            val currency = selected.selected?.takeIf { it.id == id }?.currency
            items(points, key = { "point:${it.date}" }) { point ->
                FinanceCard {
                    DateLabel(point.date)
                    if (currency != null) MoneyLabel(point.balance, currency)
                    else Text(resources.getString(R.string.currency_unavailable))
                }
            }
        }
    }
}
