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
import io.guallet.android.R
import io.guallet.android.core.money.Currency
import io.guallet.android.core.money.Money
import io.guallet.android.core.state.*
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
    val resources = androidx.compose.ui.platform.LocalResources.current

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
    var handledGeneration by rememberSaveable { mutableLongStateOf(state.generation) }
    LaunchedEffect(state.first, state.busy) {
        if (state.first != null && handledGeneration != state.generation) {
            handledGeneration = state.generation
            screen = "results"
        } else if (state.first == null && !state.busy) screen = "form"
    }
    if (screen == "schedule" && state.first != null) {
        PaymentSchedule(if (scheduleSecond) state.second!! else state.first!!, state.currency) {
            screen = "results"
        }
        return
    }
    FinancePage(
        if (mortgage) resources.getString(R.string.mortgage_calculator)
        else resources.getString(R.string.loan_comparison),
        { if (screen == "results") screen = "form" else onBack() },
    ) {
        Text(
            resources.getString(
                R.string.estimates_use_the_same_repayment_rules_as_the_existing_guallet_calculators
            )
        )
        if (screen == "form") {
            ChoiceField(
                resources.getString(R.string.currency),
                currency,
                Currency.supported.map { it.code to it.code },
                !state.busy,
            ) {
                currency = it
            }
            TextField(
                if (mortgage) resources.getString(R.string.mortgage_balance)
                else resources.getString(R.string.loan_a_amount),
                principal,
                !state.busy,
                KeyboardType.Decimal,
                onChange = { principal = it },
            )
            TextField(
                resources.getString(R.string.annual_interest_rate),
                rate,
                !state.busy,
                KeyboardType.Decimal,
                onChange = { rate = it },
            )
            TextField(
                if (mortgage) resources.getString(R.string.term_years)
                else resources.getString(R.string.term_months),
                months,
                !state.busy,
                KeyboardType.Number,
                onChange = { months = it },
            )
            if (mortgage) {
                TextField(
                    resources.getString(R.string.property_value_optional),
                    property,
                    !state.busy,
                    KeyboardType.Decimal,
                    onChange = { property = it },
                )
                TextField(
                    resources.getString(R.string.monthly_overpayment),
                    monthlyExtra,
                    !state.busy,
                    KeyboardType.Decimal,
                    onChange = { monthlyExtra = it },
                )
                TextField(
                    resources.getString(R.string.one_off_overpayment),
                    oneOff,
                    !state.busy,
                    KeyboardType.Decimal,
                    onChange = { oneOff = it },
                )
                TextField(
                    resources.getString(R.string.one_off_payment_month),
                    oneOffMonth,
                    !state.busy,
                    KeyboardType.Number,
                    onChange = { oneOffMonth = it },
                )
            } else {
                TextField(
                    resources.getString(R.string.loan_a_arrangement_fee),
                    fee,
                    !state.busy,
                    KeyboardType.Decimal,
                    onChange = { fee = it },
                )
                TextField(
                    resources.getString(R.string.loan_b_amount),
                    secondAmount,
                    !state.busy,
                    KeyboardType.Decimal,
                    onChange = { secondAmount = it },
                )
                TextField(
                    resources.getString(R.string.loan_b_annual_interest_rate),
                    secondRate,
                    !state.busy,
                    KeyboardType.Decimal,
                    onChange = { secondRate = it },
                )
                TextField(
                    resources.getString(R.string.loan_b_term_months),
                    secondMonths,
                    !state.busy,
                    KeyboardType.Number,
                    onChange = { secondMonths = it },
                )
                TextField(
                    resources.getString(R.string.loan_b_arrangement_fee),
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
                                resources.getString(
                                    R.string.use_an_amount_from_zero_to_one_trillion
                                )
                            }
                            return value
                        }
                        val inputAmount = amount(principal)
                        if (mortgage) {
                            val term = months.toInt()
                            require(term in 1..100) {
                                resources.getString(R.string.choose_a_term_from_one_to_100_years)
                            }
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
                Text(resources.getString(R.string.calculate))
            }
        } else {
            listOfNotNull(state.first, state.second).forEachIndexed { index, result ->
                FinanceCard {
                    Text(
                        if (mortgage) {
                            if (index == 0) resources.getString(R.string.without_overpayments)
                            else resources.getString(R.string.with_overpayments)
                        } else
                            resources.getString(R.string.loan_value, if (index == 0) "A" else "B"),
                        style = MaterialTheme.typography.titleLarge,
                    )
                    Text(resources.getString(R.string.scheduled_monthly_payment))
                    MoneyLabel(result.scheduled, state.currency)
                    Text(resources.getString(R.string.total_interest))
                    MoneyLabel(result.interest, state.currency)
                    Text(resources.getString(R.string.total_cost_including_fees))
                    MoneyLabel(result.totalCost, state.currency)
                    Text(
                        resources.getQuantityString(
                            R.plurals.paid_off_months,
                            result.rows.size,
                            result.rows.size,
                        )
                    )
                    if (mortgage && property.isNotBlank())
                        runCatching { Money.parse(property, state.currency) }
                            .getOrNull()
                            ?.let { money ->
                                Text(
                                    resources.getString(
                                        R.string.equity_at_payoff_constant_property_value
                                    )
                                )
                                MoneyLabel(money.amount, state.currency)
                            }
                    TextButton(
                        onClick = {
                            scheduleSecond = index == 1
                            screen = "schedule"
                        }
                    ) {
                        Text(resources.getString(R.string.view_payment_schedule))
                    }
                }
            }
            if (state.first != null && state.second != null)
                FinanceCard {
                    Text(
                        if (mortgage) resources.getString(R.string.interest_saved_with_overpayments)
                        else resources.getString(R.string.loan_b_cost_minus_loan_a)
                    )
                    MoneyLabel(
                        if (mortgage) state.first!!.interest - state.second!!.interest
                        else state.second!!.totalCost - state.first!!.totalCost,
                        state.currency,
                    )
                }
            Button(onClick = { screen = "form" }) {
                Text(resources.getString(R.string.edit_inputs))
            }
        }
    }
}

@Composable
fun PaymentSchedule(result: RepaymentResult, currency: String, onBack: () -> Unit) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    BackHandler { onBack() }
    var yearly by rememberSaveable { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().safeDrawingPadding().padding(GualletTokens.gutter)) {
        TextButton(onClick = onBack) { Text(resources.getString(R.string.back_to_results)) }
        Text(
            resources.getString(R.string.payment_schedule),
            style = MaterialTheme.typography.headlineMedium,
        )
        LabelledCheckbox(resources.getString(R.string.yearly_breakdown), yearly) { yearly = it }
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
                                Text(resources.getString(R.string.year_value, year))
                                Text(resources.getString(R.string.interest))
                                MoneyLabel(
                                    rows.fold(BigDecimal.ZERO) { total, row ->
                                        total + row.interest
                                    },
                                    currency,
                                )
                                Text(resources.getString(R.string.principal_and_overpayments))
                                MoneyLabel(
                                    rows.fold(BigDecimal.ZERO) { total, row ->
                                        total + row.principal + row.extra
                                    },
                                    currency,
                                )
                                Text(resources.getString(R.string.remaining_balance))
                                MoneyLabel(rows.last().balance, currency)
                            }
                        }
                    }
            else
                result.rows.forEach { row ->
                    item(key = row.month) {
                        FinanceCard {
                            Text(resources.getString(R.string.month_value, row.month))
                            Text(resources.getString(R.string.payment))
                            MoneyLabel(row.payment, currency)
                            Text(resources.getString(R.string.interest))
                            MoneyLabel(row.interest, currency)
                            Text(resources.getString(R.string.principal))
                            MoneyLabel(row.principal, currency)
                            if (row.extra.signum() > 0) {
                                Text(resources.getString(R.string.overpayment))
                                MoneyLabel(row.extra, currency)
                            }
                            Text(resources.getString(R.string.balance))
                            MoneyLabel(row.balance, currency)
                        }
                    }
                }
        }
    }
}

@Composable
fun StampDutyScreen(onBack: () -> Unit) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    var price by rememberSaveable { mutableStateOf("350000") }
    var buyer by rememberSaveable { mutableStateOf("standard") }
    var error by remember { mutableStateOf<String?>(null) }
    var bands by remember { mutableStateOf<List<StampBand>?>(null) }
    var details by rememberSaveable { mutableStateOf(false) }
    LaunchedEffect(bands) { if (bands == null) details = false }
    BackHandler(details) { details = false }
    FinancePage(
        if (details) resources.getString(R.string.stamp_duty_bands)
        else resources.getString(R.string.stamp_duty_calculator),
        { if (details) details = false else onBack() },
    ) {
        Text(
            resources.getString(
                R.string
                    .england_and_northern_ireland_april_2025_rules_matching_the_existing_calculator
            )
        )
        if (!details) {
            TextField(
                resources.getString(R.string.property_price_whole_pounds),
                price,
                keyboard = KeyboardType.Number,
                onChange = {
                    price = it
                    bands = null
                    error = null
                },
            )
            ChoiceField(
                resources.getString(R.string.buyer_type),
                buyer,
                listOf(
                    "standard" to resources.getString(R.string.standard),
                    resources.getString(R.string.firsttimebuyer) to
                        resources.getString(R.string.first_time_buyer),
                    resources.getString(R.string.additionalproperty) to
                        resources.getString(R.string.additional_property),
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
                        error =
                            failure.userMessage(resources)
                                ?: resources.getString(R.string.enter_a_valid_property_price)
                    }
                }
            ) {
                Text(resources.getString(R.string.calculate))
            }
            error?.let { ErrorNotice(it) }
            bands?.let { list ->
                FinanceCard {
                    Text(resources.getString(R.string.stamp_duty_due))
                    MoneyLabel(list.fold(BigDecimal.ZERO) { sum, band -> sum + band.tax }, "GBP")
                    if (
                        buyer == resources.getString(R.string.firsttimebuyer) &&
                            price.toBigDecimal() > BigDecimal(500000)
                    )
                        Text(
                            resources.getString(
                                R.string.first_time_buyer_relief_is_unavailable_above_value,
                                Money.fromCurrencyCode(BigDecimal(500000), "GBP")
                                    .format(java.util.Locale.UK),
                            )
                        )
                    TextButton(onClick = { details = true }) {
                        Text(resources.getString(R.string.view_tax_bands))
                    }
                }
            }
        } else
            bands?.forEach { band ->
                FinanceCard {
                    Text(resources.getString(R.string.value_band, band.rate))
                    MoneyLabel(BigDecimal(band.from), "GBP")
                    band.to?.let { MoneyLabel(BigDecimal(it), "GBP") }
                        ?: Text(resources.getString(R.string.no_upper_limit))
                    Text(resources.getString(R.string.taxable_amount))
                    MoneyLabel(band.taxable, "GBP")
                    Text(resources.getString(R.string.tax_due))
                    MoneyLabel(band.tax, "GBP")
                }
            }
    }
}
