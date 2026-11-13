package io.guallet.android.features.calculators

import io.guallet.android.R
import io.guallet.android.core.money.Money
import io.guallet.android.core.state.*
import java.math.BigDecimal
import java.math.MathContext
import java.math.RoundingMode

private val context = MathContext.DECIMAL128
private val zero = BigDecimal.ZERO
private val one = BigDecimal.ONE

private fun BigDecimal.round(currency: String, mode: RoundingMode = RoundingMode.HALF_UP) =
    Money.fromCurrencyCode(this, currency).round(mode).amount

data class PaymentRow(
    val month: Int,
    val interest: BigDecimal,
    val principal: BigDecimal,
    val extra: BigDecimal,
    val payment: BigDecimal,
    val balance: BigDecimal,
)

data class RepaymentResult(
    val scheduled: BigDecimal,
    val rows: List<PaymentRow>,
    val fee: BigDecimal = zero,
) {
    val interest
        get() = rows.fold(zero) { sum, row -> sum + row.interest }

    val totalPaid
        get() = rows.fold(zero) { sum, row -> sum + row.payment }

    val totalCost
        get() = totalPaid + fee
}

data class MortgageInput(
    val principal: BigDecimal,
    val annualRate: BigDecimal,
    val months: Int,
    val monthlyExtra: BigDecimal = zero,
    val oneOff: BigDecimal = zero,
    val oneOffMonth: Int? = null,
)

object Calculators {
    fun scheduled(
        principal: BigDecimal,
        annualRate: BigDecimal,
        months: Int,
        currency: String,
        up: Boolean,
    ): BigDecimal {
        require(
            principal > zero &&
                months in 1..1200 &&
                annualRate >= zero &&
                annualRate <= BigDecimal(100)
        ) {
            throw UiMessageException(
                uiMessage(R.string.message_check_the_amount_interest_rate_and_term)
            )
        }
        val rate = annualRate.divide(BigDecimal(1200), context)
        val raw =
            if (rate.signum() == 0) principal.divide(BigDecimal(months), context)
            else
                principal
                    .multiply(rate, context)
                    .divide(one - one.divide((one + rate).pow(months, context), context), context)
        return raw.round(currency, if (up) RoundingMode.UP else RoundingMode.HALF_UP)
    }

    fun loan(
        principal: BigDecimal,
        annualRate: BigDecimal,
        months: Int,
        fee: BigDecimal,
        currency: String,
    ): RepaymentResult {
        require(months in 1..600 && fee >= zero)
        val payment = scheduled(principal, annualRate, months, currency, false)
        val rate = annualRate.divide(BigDecimal(1200), context)
        require(payment > (principal * rate).round(currency)) {
            throw UiMessageException(
                uiMessage(
                    R.string.message_increase_the_amount_or_shorten_the_term_so_the_balance_can_fall
                )
            )
        }
        var balance = principal
        val rows = mutableListOf<PaymentRow>()
        for (month in 1..months) {
            val interest = (balance * rate).round(currency)
            val capital =
                if (month == months) balance else minOf(balance, payment - interest).round(currency)
            balance = maxOf(zero, balance - capital).round(currency)
            rows.add(
                PaymentRow(
                    month,
                    interest,
                    capital,
                    zero,
                    (interest + capital).round(currency),
                    balance,
                )
            )
        }
        return RepaymentResult(payment, rows, fee)
    }

    fun mortgage(input: MortgageInput, currency: String): RepaymentResult {
        require(input.monthlyExtra >= zero && input.oneOff >= zero)
        require(input.oneOff.signum() == 0 || input.oneOffMonth in 1..input.months) {
            throw UiMessageException(
                uiMessage(R.string.message_choose_an_overpayment_month_within_the_mortgage_term)
            )
        }
        val scheduled = scheduled(input.principal, input.annualRate, input.months, currency, true)
        val rate = input.annualRate.divide(BigDecimal(1200), context)
        var balance = input.principal
        val rows = mutableListOf<PaymentRow>()
        val minor =
            BigDecimal.ONE.movePointLeft(
                io.guallet.android.core.money.Currency.fromISOCode(currency).decimalPlaces
            )
        val tolerance =
            maxOf(minor, minOf(minor * BigDecimal(input.months), scheduled * BigDecimal("0.01")))
        for (month in 1..input.months + 1200) {
            if (balance.signum() <= 0) break
            val interest = (balance * rate).round(currency)
            var principal = minOf(balance, maxOf(zero, scheduled - interest).round(currency))
            if (month == input.months && (balance - principal).round(currency) <= tolerance)
                principal = balance
            val requested =
                (input.monthlyExtra + if (month == input.oneOffMonth) input.oneOff else zero).round(
                    currency
                )
            val extra = minOf((balance - principal).round(currency), requested)
            require(principal + extra > zero) {
                throw UiMessageException(
                    uiMessage(R.string.message_increase_the_payment_so_the_balance_can_fall)
                )
            }
            balance = maxOf(zero, balance - principal - extra).round(currency)
            rows.add(
                PaymentRow(
                    month,
                    interest,
                    principal,
                    extra,
                    (interest + principal + extra).round(currency),
                    balance,
                )
            )
        }
        require(balance.signum() == 0) {
            throw UiMessageException(
                uiMessage(R.string.message_the_mortgage_did_not_repay_within_the_supported_term)
            )
        }
        return RepaymentResult(scheduled, rows)
    }
}

data class StampBand(
    val from: Long,
    val to: Long?,
    val rate: Int,
    val taxable: BigDecimal,
    val tax: BigDecimal,
)

fun stampDuty(price: BigDecimal, buyer: String): List<StampBand> {
    require(price.signum() > 0 && price.scale() <= 0 && price <= BigDecimal("1000000000000")) {
        throw UiMessageException(
            uiMessage(
                R.string.message_enter_a_whole_pound_property_price_from_one_pound_to_one_trillion
            )
        )
    }
    val firstTime = buyer == "firstTimeBuyer" && price <= BigDecimal(500000)
    val extra = if (buyer == "additionalProperty" && price >= BigDecimal(40000)) 5 else 0
    val bands =
        if (firstTime) listOf(Triple(0L, 300000L as Long?, 0), Triple(300000L, 500000L as Long?, 5))
        else
            listOf(
                Triple(0L, 125000L as Long?, 0),
                Triple(125000L, 250000L as Long?, 2),
                Triple(250000L, 925000L as Long?, 5),
                Triple(925000L, 1500000L as Long?, 10),
                Triple(1500000L, null, 12),
            )
    return bands.map { (from, to, rate) ->
        val taxable =
            maxOf(zero, minOf(price, to?.let { BigDecimal(it) } ?: price) - BigDecimal(from))
        StampBand(
            from,
            to,
            rate + extra,
            taxable,
            (taxable * BigDecimal(rate + extra)).divide(BigDecimal(100), 0, RoundingMode.FLOOR),
        )
    }
}
