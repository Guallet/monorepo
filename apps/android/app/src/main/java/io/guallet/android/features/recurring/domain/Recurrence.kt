package io.guallet.android.features.recurring.domain

import java.time.LocalDate
import java.time.temporal.ChronoUnit

fun nextPaymentDate(payment: RecurringPayment, from: LocalDate = LocalDate.now()): LocalDate? {
    val anchor =
        runCatching { LocalDate.parse(payment.startDate?.take(10)) }.getOrNull() ?: return null
    val days =
        when (payment.cadence) {
            "weekly" -> 7L
            "biweekly" -> 14L
            else -> null
        }
    val months =
        when (payment.cadence) {
            "monthly" -> 1L
            "quarterly" -> 3L
            "yearly" -> 12L
            else -> null
        }
    if (days == null && months == null) return null
    val index =
        if (days != null) (ChronoUnit.DAYS.between(anchor, from) / days).coerceAtLeast(0)
        else
            (ChronoUnit.MONTHS.between(anchor.withDayOfMonth(1), from.withDayOfMonth(1)) / months!!)
                .coerceAtLeast(0)
    fun occurrence(i: Long) =
        if (days != null) anchor.plusDays(i * days) else anchor.plusMonths(i * months!!)
    val candidate = occurrence(index)
    return if (candidate < from) occurrence(index + 1) else candidate
}

fun monthlyEquivalent(payment: RecurringPayment): java.math.BigDecimal {
    val annualFactor =
        when (payment.cadence) {
            "weekly" -> 52
            "biweekly" -> 26
            "monthly" -> 12
            "quarterly" -> 4
            "yearly" -> 1
            else -> return java.math.BigDecimal.ZERO
        }
    return payment.amount
        .multiply(java.math.BigDecimal(annualFactor))
        .divide(java.math.BigDecimal(12), java.math.MathContext.DECIMAL128)
}

data class UpcomingPayment(val payment: RecurringPayment, val date: LocalDate)

fun upcomingPayments(
    items: List<RecurringPayment>,
    from: LocalDate,
    through: LocalDate,
): List<UpcomingPayment> {
    val result = mutableListOf<UpcomingPayment>()
    for (payment in items) {
        var date = nextPaymentDate(payment, from)
        while (date != null && date <= through) {
            result.add(UpcomingPayment(payment, date))
            date = nextPaymentDate(payment, date.plusDays(1))
        }
    }
    return result.sortedWith(compareBy<UpcomingPayment> { it.date }.thenBy { it.payment.name })
}

fun RecurringPayment.displayAmount(): java.math.BigDecimal =
    if (type == "regular_income") amount.abs() else -amount.abs()
