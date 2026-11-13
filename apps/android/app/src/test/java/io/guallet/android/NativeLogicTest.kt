package io.guallet.android

import io.guallet.android.core.money.*
import io.guallet.android.features.auth.data.parseNativeCallback
import io.guallet.android.features.calculators.*
import io.guallet.android.features.categories.domain.Category
import io.guallet.android.features.categories.presentation.availableParents
import io.guallet.android.features.notifications.presentation.notificationRoute
import io.guallet.android.features.recurring.domain.*
import io.guallet.android.features.transfer.*
import java.math.BigDecimal
import java.time.LocalDate
import java.util.Locale
import org.junit.Assert.*
import org.junit.Test

class NativeLogicTest {
    @Test
    fun `currency precision follows shared registry including non-two-decimal currencies`() {
        assertEquals(0, Currency.fromISOCode("JPY").decimalPlaces)
        assertEquals(3, Currency.fromISOCode("BHD").decimalPlaces)
        assertEquals(4, Currency.fromISOCode("UYW").decimalPlaces)
        assertEquals(2, Currency.fromISOCode("gbp").decimalPlaces)
        assertEquals(
            BigDecimal("0.30"),
            (Money.parse("0.10", "GBP") + Money.parse("0.20", "GBP")).amount,
        )
        assertEquals(BigDecimal("12.345"), Money.parse("12,345", "BHD").amount)
        for ((value, currency) in
            listOf("1.1" to "JPY", "1.001" to "GBP", "NaN" to "GBP", "1,234.00" to "GBP")) {
            try {
                Money.parse(value, currency)
                fail("Must reject $value $currency")
            } catch (_: IllegalArgumentException) {}
        }
        try {
            Money.parse("1", "GBP") + Money.parse("1", "USD")
            fail("Must reject mixed currencies")
        } catch (_: IllegalArgumentException) {}
    }

    @Test
    fun `native money matches shared library representative locale fixtures`() {
        assertEquals("£1,234.56", Money.parse("1234.56", "GBP").format(Locale.UK))
        assertEquals("-$42.50", Money.parse("-42.50", "USD").format(Locale.US))
        assertEquals("¥1,235", Money.parse("1235", "JPY").format(Locale.UK))
        assertEquals(
            "1.234,56 €",
            Money.parse("1234.56", "EUR").format(Locale.GERMANY).replace('\u00a0', ' '),
        )
    }

    @Test
    fun `native loan matches existing calculator defaults and final payment rounding`() {
        val result =
            Calculators.loan(BigDecimal("10000"), BigDecimal("6.9"), 60, BigDecimal.ZERO, "GBP")
        assertEquals(BigDecimal("197.54"), result.scheduled)
        assertEquals(BigDecimal("11852.46"), result.totalPaid)
        assertEquals(BigDecimal("1852.46"), result.interest)
        assertEquals(BigDecimal("197.60"), result.rows.last().payment)
        assertEquals(BigDecimal("0.00"), result.rows.last().balance)
        val zero = Calculators.loan(BigDecimal("2.01"), BigDecimal.ZERO, 2, BigDecimal.ZERO, "GBP")
        assertEquals(listOf(BigDecimal("1.01"), BigDecimal("1.00")), zero.rows.map { it.payment })
        val other =
            Calculators.loan(BigDecimal("10000"), BigDecimal("8.5"), 48, BigDecimal("150"), "GBP")
        assertEquals(BigDecimal("11981.18"), other.totalCost)
    }

    @Test
    fun `mortgage overpayments reduce term and interest and zero-rate schedule repays`() {
        val input = MortgageInput(BigDecimal("250000"), BigDecimal("4.75"), 300)
        val baseline = Calculators.mortgage(input, "GBP")
        val repaid = Calculators.mortgage(input.copy(monthlyExtra = BigDecimal("200")), "GBP")
        assertTrue(repaid.interest < baseline.interest)
        assertTrue(repaid.rows.size < baseline.rows.size)
        assertEquals(0, repaid.rows.last().balance.signum())
        val zero =
            Calculators.mortgage(MortgageInput(BigDecimal("1200"), BigDecimal.ZERO, 12), "JPY")
        assertEquals(BigDecimal("100"), zero.scheduled)
        assertEquals(12, zero.rows.size)
    }

    @Test
    fun `stamp duty matches source calculator relief and surcharge boundaries`() {
        fun total(value: String, buyer: String) =
            stampDuty(BigDecimal(value), buyer).fold(BigDecimal.ZERO) { sum, band ->
                sum + band.tax
            }
        assertEquals(BigDecimal("7500"), total("350000", "standard"))
        assertEquals(BigDecimal("2500"), total("350000", "firstTimeBuyer"))
        assertEquals(BigDecimal("25000"), total("350000", "additionalProperty"))
        assertEquals(BigDecimal.ZERO, total("39999", "additionalProperty"))
        assertEquals(BigDecimal("2000"), total("40000", "additionalProperty"))
    }

    @Test
    fun `recurrence keeps calendar anchors across short months and skips past dates`() {
        val item =
            RecurringPayment(
                "1",
                "Rent",
                BigDecimal("100"),
                "GBP",
                "monthly",
                "regular_payment",
                "2026-01-31",
            )
        assertEquals(
            LocalDate.parse("2026-02-28"),
            nextPaymentDate(item, LocalDate.parse("2026-02-01")),
        )
        assertEquals(
            LocalDate.parse("2026-03-31"),
            nextPaymentDate(item, LocalDate.parse("2026-03-01")),
        )
        assertNull(nextPaymentDate(item.copy(startDate = null)))
        assertNull(nextPaymentDate(item.copy(cadence = "future")))
    }

    @Test
    fun `CSV parses BOM quoted delimiters multiline CRLF and escaped quotes`() {
        val csv =
            CsvParser.parse(
                "\uFEFFdate,amount,description\r\n2026-11-13,12.50,\"Coffee, cake\"\r\n2026-11-14,-5,\"Line one\nLine \"two\"\"\r\n"
                    .replace("Line \"two\"", "Line \"\"two\"\"")
            )
        assertEquals(2, csv.rows.size)
        assertEquals("Coffee, cake", csv.rows.first()["description"])
        assertEquals("Line one\nLine \"two\"", csv.rows.last()["description"])
        assertEquals(
            2,
            CsvParser.parse("date;amount;description\n2026-11-13;1,25;Coffee").columns.size - 1,
        )
    }

    @Test
    fun `CSV rejects malformed headers rows quotes and invalid dates`() {
        for (text in listOf("date,date\n1,2", "date,amount\n1,2,3", "date,amount\n1,\"2", "")) {
            try {
                CsvParser.parse(text)
                fail("Must reject malformed CSV")
            } catch (_: IllegalArgumentException) {}
        }
        assertFalse(CsvParser.validDate("2026-02-30"))
        assertTrue(CsvParser.validDate("13/11/2026"))
        assertTrue(CsvParser.validDate("2026-11-13T12:30:00Z"))
        assertEquals(
            3,
            CsvParser.rowErrors(
                    mapOf("d" to "bad", "a" to "NaN", "n" to ""),
                    FieldMappings(date = "d", amount = "a", description = "n"),
                )
                .size,
        )
    }

    @Test
    fun `category hierarchy and notification navigation preserve mobile constraints`() {
        val root = Category("1", "Root", "IconTags", "#005EB8")
        val child = Category("2", "Child", "IconTags", "#005EB8", "1")
        assertTrue(availableParents(listOf(root, child), "1").isEmpty())
        assertEquals(listOf(root), availableParents(listOf(root, child), "2"))
        assertEquals("accounts", notificationRoute("/accounts"))
        assertNull(notificationRoute("https://evil.test/accounts"))
        assertNull(notificationRoute("/accounts?x=1"))
        assertNull(notificationRoute("/unknown"))
    }

    @Test
    fun `native callbacks reject unrelated schemes hosts duplicate keys and fragments`() {
        assertEquals(
            "abc",
            parseNativeCallback("guallet-android://login/reset-password?token=abc")
                ?.parameters
                ?.get("token"),
        )
        assertNull(parseNativeCallback("guallet://login/callback?flow=1"))
        assertNull(parseNativeCallback("guallet-android://evil/callback?flow=1"))
        assertNull(parseNativeCallback("guallet-android://login/callback?flow=1&flow=2"))
        assertNull(parseNativeCallback("guallet-android://login/callback?flow=1#cookie=stolen"))
    }
}
