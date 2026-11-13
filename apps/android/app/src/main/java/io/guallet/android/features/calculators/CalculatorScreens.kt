package io.guallet.android.features.calculators

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.guallet.android.core.money.Currency
import io.guallet.android.core.money.Money
import io.guallet.android.ui.components.*
import io.guallet.android.ui.theme.GualletTokens
import java.math.BigDecimal

@Composable
fun RepaymentScreen(
    mortgage: Boolean,
    model: CalculatorViewModel,
    defaultCurrency: String,
    onBack: () -> Unit,
) {
    val state by model.state.collectAsStateWithLifecycle()
    var currency by rememberSaveable { mutableStateOf(defaultCurrency) }
    var principal by rememberSaveable { mutableStateOf(if (mortgage) "250000" else "10000") }
    var rate by rememberSaveable { mutableStateOf(if (mortgage) "4.75" else "6.9") }
    var months by rememberSaveable { mutableStateOf(if (mortgage) "25" else "60") }
    var property by rememberSaveable { mutableStateOf("350000") }
    var monthlyExtra by rememberSaveable { mutableStateOf("200") }
    var oneOff by rememberSaveable { mutableStateOf("0") }
    var oneOffMonth by rememberSaveable { mutableStateOf("12") }
    var fee by rememberSaveable { mutableStateOf("0") }
    var secondAmount by rememberSaveable { mutableStateOf("10000") }
    var secondRate by rememberSaveable { mutableStateOf("8.5") }
    var secondMonths by rememberSaveable { mutableStateOf("48") }
    var secondFee by rememberSaveable { mutableStateOf("150") }
    var screen by rememberSaveable { mutableStateOf("form") }
    var scheduleSecond by rememberSaveable { mutableStateOf(false) }
    BackHandler(screen != "form" && !state.busy) {
        screen = if (screen == "schedule") "results" else "form"
    }
    LaunchedEffect(mortgage) { model.clear() }
    LaunchedEffect(state.first) {
        if (state.first != null) screen = "results" else if (!state.busy) screen = "form"
    }
    if (screen == "schedule" && state.first != null) {
        PaymentSchedule(if (scheduleSecond) state.second!! else state.first!!, state.currency) {
            screen = "results"
        }
        return
    }
    FinancePage(
        if (mortgage) "Mortgage calculator" else "Loan comparison",
        { if (screen == "results") screen = "form" else onBack() },
    ) {
        Text("Estimates use the same repayment rules as the existing Guallet calculators.")
        if (screen == "form") {
            ChoiceField(
                "Currency",
                currency,
                Currency.supported.map { it.code to it.code },
                !state.busy,
            ) {
                currency = it
            }
            TextField(
                if (mortgage) "Mortgage balance" else "Loan A amount",
                principal,
                !state.busy,
                KeyboardType.Decimal,
                onChange = { principal = it },
            )
            TextField(
                "Annual interest rate (%)",
                rate,
                !state.busy,
                KeyboardType.Decimal,
                onChange = { rate = it },
            )
            TextField(
                if (mortgage) "Term (years)" else "Term (months)",
                months,
                !state.busy,
                KeyboardType.Number,
                onChange = { months = it },
            )
            if (mortgage) {
                TextField(
                    "Property value (optional)",
                    property,
                    !state.busy,
                    KeyboardType.Decimal,
                    onChange = { property = it },
                )
                TextField(
                    "Monthly overpayment",
                    monthlyExtra,
                    !state.busy,
                    KeyboardType.Decimal,
                    onChange = { monthlyExtra = it },
                )
                TextField(
                    "One-off overpayment",
                    oneOff,
                    !state.busy,
                    KeyboardType.Decimal,
                    onChange = { oneOff = it },
                )
                TextField(
                    "One-off payment month",
                    oneOffMonth,
                    !state.busy,
                    KeyboardType.Number,
                    onChange = { oneOffMonth = it },
                )
            } else {
                TextField(
                    "Loan A arrangement fee",
                    fee,
                    !state.busy,
                    KeyboardType.Decimal,
                    onChange = { fee = it },
                )
                TextField(
                    "Loan B amount",
                    secondAmount,
                    !state.busy,
                    KeyboardType.Decimal,
                    onChange = { secondAmount = it },
                )
                TextField(
                    "Loan B annual interest rate (%)",
                    secondRate,
                    !state.busy,
                    KeyboardType.Decimal,
                    onChange = { secondRate = it },
                )
                TextField(
                    "Loan B term (months)",
                    secondMonths,
                    !state.busy,
                    KeyboardType.Number,
                    onChange = { secondMonths = it },
                )
                TextField(
                    "Loan B arrangement fee",
                    secondFee,
                    !state.busy,
                    KeyboardType.Decimal,
                    onChange = { secondFee = it },
                )
            }
            if (state.busy) LinearProgressIndicator(Modifier.fillMaxWidth())
            state.error?.let { ErrorNotice(it) }
            Button(
                enabled = !state.busy,
                onClick = {
                    model.calculate(currency) {
                        fun amount(text: String): BigDecimal {
                            val value = Money.parse(text, currency).amount
                            require(
                                value >= BigDecimal.ZERO && value <= BigDecimal("1000000000000")
                            ) {
                                "Use an amount from zero to one trillion."
                            }
                            return value
                        }
                        val inputAmount = amount(principal)
                        if (mortgage) {
                            val term = months.toInt()
                            require(term in 1..100) { "Choose a term from one to 100 years." }
                            if (property.isNotBlank()) amount(property)
                            val input =
                                MortgageInput(
                                    inputAmount,
                                    rate.toBigDecimal(),
                                    term * 12,
                                    amount(monthlyExtra),
                                    amount(oneOff),
                                    oneOffMonth.toIntOrNull(),
                                )
                            Calculators.mortgage(
                                input.copy(
                                    monthlyExtra = BigDecimal.ZERO,
                                    oneOff = BigDecimal.ZERO,
                                    oneOffMonth = null,
                                ),
                                currency,
                            ) to Calculators.mortgage(input, currency)
                        } else
                            Calculators.loan(
                                inputAmount,
                                rate.toBigDecimal(),
                                months.toInt(),
                                amount(fee),
                                currency,
                            ) to
                                Calculators.loan(
                                    amount(secondAmount),
                                    secondRate.toBigDecimal(),
                                    secondMonths.toInt(),
                                    amount(secondFee),
                                    currency,
                                )
                    }
                },
            ) {
                Text("Calculate")
            }
        } else {
            listOfNotNull(state.first, state.second).forEachIndexed { index, result ->
                FinanceCard {
                    Text(
                        if (mortgage) {
                            if (index == 0) "Without overpayments" else "With overpayments"
                        } else "Loan ${if (index == 0) "A" else "B"}",
                        style = MaterialTheme.typography.titleLarge,
                    )
                    Text("Scheduled monthly payment")
                    MoneyLabel(result.scheduled, state.currency)
                    Text("Total interest")
                    MoneyLabel(result.interest, state.currency)
                    Text("Total cost including fees")
                    MoneyLabel(result.totalCost, state.currency)
                    Text("Paid off in ${result.rows.size} months")
                    if (mortgage && property.isNotBlank())
                        runCatching { Money.parse(property, state.currency) }
                            .getOrNull()
                            ?.let { money ->
                                Text("Equity at payoff (constant property value)")
                                MoneyLabel(money.amount, state.currency)
                            }
                    TextButton(
                        onClick = {
                            scheduleSecond = index == 1
                            screen = "schedule"
                        }
                    ) {
                        Text("View payment schedule")
                    }
                }
            }
            if (state.first != null && state.second != null)
                FinanceCard {
                    Text(
                        if (mortgage) "Interest saved with overpayments"
                        else "Loan B cost minus loan A"
                    )
                    MoneyLabel(
                        if (mortgage) state.first!!.interest - state.second!!.interest
                        else state.second!!.totalCost - state.first!!.totalCost,
                        state.currency,
                    )
                }
            Button(onClick = { screen = "form" }) { Text("Edit inputs") }
        }
    }
}

@Composable
fun PaymentSchedule(result: RepaymentResult, currency: String, onBack: () -> Unit) {
    BackHandler { onBack() }
    var yearly by rememberSaveable { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().safeDrawingPadding().padding(GualletTokens.gutter)) {
        TextButton(onClick = onBack) { Text("Back to results") }
        Text("Payment schedule", style = MaterialTheme.typography.headlineMedium)
        Row {
            Checkbox(yearly, onCheckedChange = { yearly = it })
            Text("Yearly breakdown")
        }
        LazyColumn(
            Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(GualletTokens.small),
        ) {
            if (yearly)
                result.rows
                    .groupBy { (it.month - 1) / 12 + 1 }
                    .forEach { (year, rows) ->
                        item(key = year) {
                            FinanceCard {
                                Text("Year $year")
                                Text("Interest")
                                MoneyLabel(
                                    rows.fold(BigDecimal.ZERO) { total, row ->
                                        total + row.interest
                                    },
                                    currency,
                                )
                                Text("Principal and overpayments")
                                MoneyLabel(
                                    rows.fold(BigDecimal.ZERO) { total, row ->
                                        total + row.principal + row.extra
                                    },
                                    currency,
                                )
                                Text("Remaining balance")
                                MoneyLabel(rows.last().balance, currency)
                            }
                        }
                    }
            else
                result.rows.forEach { row ->
                    item(key = row.month) {
                        FinanceCard {
                            Text("Month ${row.month}")
                            Text("Payment")
                            MoneyLabel(row.payment, currency)
                            Text("Interest")
                            MoneyLabel(row.interest, currency)
                            Text("Principal")
                            MoneyLabel(row.principal, currency)
                            if (row.extra.signum() > 0) {
                                Text("Overpayment")
                                MoneyLabel(row.extra, currency)
                            }
                            Text("Balance")
                            MoneyLabel(row.balance, currency)
                        }
                    }
                }
        }
    }
}

@Composable
fun StampDutyScreen(onBack: () -> Unit) {
    var price by rememberSaveable { mutableStateOf("350000") }
    var buyer by rememberSaveable { mutableStateOf("standard") }
    var error by remember { mutableStateOf<String?>(null) }
    var bands by remember { mutableStateOf<List<StampBand>?>(null) }
    var details by rememberSaveable { mutableStateOf(false) }
    LaunchedEffect(bands) { if (bands == null) details = false }
    BackHandler(details) { details = false }
    FinancePage(
        if (details) "Stamp duty bands" else "Stamp duty calculator",
        { if (details) details = false else onBack() },
    ) {
        Text("England and Northern Ireland · April 2025 rules, matching the existing calculator.")
        if (!details) {
            TextField(
                "Property price (whole pounds)",
                price,
                keyboard = KeyboardType.Number,
                onChange = {
                    price = it
                    bands = null
                    error = null
                },
            )
            ChoiceField(
                "Buyer type",
                buyer,
                listOf(
                    "standard" to "Standard",
                    "firstTimeBuyer" to "First-time buyer",
                    "additionalProperty" to "Additional property",
                ),
            ) {
                buyer = it
                bands = null
            }
            Button(
                onClick = {
                    try {
                        bands = stampDuty(price.toBigDecimal(), buyer)
                        error = null
                    } catch (failure: Exception) {
                        error = failure.message ?: "Enter a valid property price."
                    }
                }
            ) {
                Text("Calculate")
            }
            error?.let { ErrorNotice(it) }
            bands?.let { list ->
                FinanceCard {
                    Text("Stamp duty due")
                    MoneyLabel(list.fold(BigDecimal.ZERO) { sum, band -> sum + band.tax }, "GBP")
                    if (buyer == "firstTimeBuyer" && price.toBigDecimal() > BigDecimal(500000))
                        Text(
                            "First-time buyer relief is unavailable above ${Money.fromCurrencyCode(BigDecimal(500000), "GBP").format(java.util.Locale.UK)}."
                        )
                    TextButton(onClick = { details = true }) { Text("View tax bands") }
                }
            }
        } else
            bands?.forEach { band ->
                FinanceCard {
                    Text("${band.rate}% band")
                    MoneyLabel(BigDecimal(band.from), "GBP")
                    band.to?.let { MoneyLabel(BigDecimal(it), "GBP") } ?: Text("No upper limit")
                    Text("Taxable amount")
                    MoneyLabel(band.taxable, "GBP")
                    Text("Tax due")
                    MoneyLabel(band.tax, "GBP")
                }
            }
    }
}
