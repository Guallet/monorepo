package io.guallet.android

import android.app.Application
import androidx.test.core.app.ApplicationProvider
import io.guallet.android.core.money.Money
import io.guallet.android.core.state.UiMessageException
import io.guallet.android.core.state.userMessage
import io.guallet.android.ui.components.formatPreferenceDate
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [29], application = Application::class, qualifiers = "en-rGB")
class AndroidResourcesTest {
    private val resources
        get() = ApplicationProvider.getApplicationContext<Application>().resources

    @Test
    fun `every string with arguments has a valid positional format`() {
        R.string::class.java.fields.forEach { field ->
            val id = field.getInt(null)
            val raw = resources.getString(id)
            val count =
                Regex("%([0-9]+)\\\$[sd]")
                    .findAll(raw)
                    .map { it.groupValues[1].toInt() }
                    .maxOrNull()
            if (count != null) {
                val rendered =
                    resources.getString(
                        id,
                        *Array<Any>(count) { index ->
                            if (raw.contains("%${index + 1}\$d")) 2 else "value"
                        },
                    )
                assertFalse(
                    "Unexpanded format in ${field.name}",
                    rendered.contains(Regex("%[0-9]+\\\$[sd]")),
                )
            }
        }
    }

    @Test
    fun `quantity messages handle one zero and many`() {
        assertEquals("One row", resources.getQuantityString(R.plurals.csv_row_count, 1, 1))
        assertEquals("0 rows", resources.getQuantityString(R.plurals.csv_row_count, 0, 0))
        assertEquals(
            "20000 rows",
            resources.getQuantityString(R.plurals.csv_row_count, 20_000, 20_000),
        )
        assertEquals(
            "Resend code in one second",
            resources.getQuantityString(R.plurals.resend_seconds, 1, 1),
        )
    }

    @Test
    fun `currency validation keeps resource arguments until display`() {
        val error =
            runCatching { Money.parse("1.234", "GBP") }.exceptionOrNull() as UiMessageException
        assertEquals("GBP supports 2 decimal places.", error.userMessage(resources))
    }

    @Test
    fun `display dates follow the selected preference`() {
        assertEquals("13/11/2026", formatPreferenceDate("2026-11-13T16:30:00Z", "DD/MM/YYYY"))
        assertEquals("11/13/2026", formatPreferenceDate("2026-11-13", "MM/DD/YYYY"))
        assertEquals("2026/11/13", formatPreferenceDate("2026-11-13", "YYYY/MM/DD"))
    }
}
