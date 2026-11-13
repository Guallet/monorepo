package io.guallet.android.core.money

import io.guallet.android.R
import io.guallet.android.core.state.*
import java.math.BigDecimal
import java.math.RoundingMode
import java.text.DecimalFormat
import java.text.NumberFormat
import java.util.Locale

@ConsistentCopyVisibility
data class Currency
internal constructor(
    val code: String,
    val name: String,
    val decimalPlaces: Int,
    val symbol: String,
) {
    companion object {
        val supported: List<Currency>
            get() = currencyCatalog

        fun fromISOCode(code: String): Currency =
            currencyCatalog.firstOrNull { it.code == code.trim().uppercase(Locale.ROOT) }
                ?: throw UiMessageException(
                    uiMessage(R.string.message_choose_a_supported_currency_code)
                )
    }
}

/** Amounts are major units. No binary floating-point conversions or mixed-currency arithmetic. */
@ConsistentCopyVisibility
data class Money private constructor(val amount: BigDecimal, val currency: Currency) {
    companion object {
        fun fromCurrencyCode(amount: BigDecimal, currencyCode: String) =
            Money(amount, Currency.fromISOCode(currencyCode))

        fun zero(currency: Currency) = Money(BigDecimal.ZERO, currency)

        fun parse(text: String, currencyCode: String): Money {
            val currency = Currency.fromISOCode(currencyCode)
            val normalized = text.trim().replace(',', '.')
            require(Regex("-?[0-9]+(?:\\.[0-9]+)?").matches(normalized)) {
                throw UiMessageException(
                    uiMessage(R.string.message_enter_a_valid_amount_without_grouping_separators)
                )
            }
            val value = normalized.toBigDecimal()
            require(value.scale() <= currency.decimalPlaces) {
                throw UiMessageException(
                    uiPlural(
                        R.plurals.currency_precision,
                        currency.decimalPlaces,
                        currency.code,
                        currency.decimalPlaces,
                    )
                )
            }
            return Money(value, currency)
        }
    }

    operator fun plus(other: Money): Money {
        require(currency.code == other.currency.code) {
            throw UiMessageException(uiMessage(R.string.message_amounts_must_use_the_same_currency))
        }
        return Money(amount + other.amount, currency)
    }

    fun round(mode: RoundingMode = RoundingMode.HALF_UP) =
        Money(amount.setScale(currency.decimalPlaces, mode), currency)

    fun format(locale: Locale = Locale.getDefault(), includeCode: Boolean = false): String {
        val formatter = NumberFormat.getCurrencyInstance(locale) as DecimalFormat
        val symbols = formatter.decimalFormatSymbols
        symbols.internationalCurrencySymbol = currency.code
        symbols.currencySymbol = currency.symbol
        formatter.decimalFormatSymbols = symbols
        formatter.minimumFractionDigits = currency.decimalPlaces
        formatter.maximumFractionDigits = currency.decimalPlaces
        formatter.roundingMode = RoundingMode.HALF_UP
        return formatter.format(amount) + if (includeCode) " ${currency.code}" else ""
    }
}
