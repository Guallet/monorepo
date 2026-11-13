package io.guallet.android.ui.components

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.compositionLocalOf
import java.time.LocalDate
import java.time.format.DateTimeFormatter

val LocalDateFormat = compositionLocalOf { "DD/MM/YYYY" }

fun formatPreferenceDate(raw: String, format: String): String =
    runCatching {
            val pattern =
                when (format) {
                    "MM/DD/YYYY" -> "MM/dd/uuuu"
                    "YYYY/MM/DD" -> "uuuu/MM/dd"
                    else -> "dd/MM/uuuu"
                }
            LocalDate.parse(raw.take(10)).format(DateTimeFormatter.ofPattern(pattern))
        }
        .getOrDefault(raw.take(10))

@Composable
fun DateLabel(raw: String) {
    Text(formatPreferenceDate(raw, LocalDateFormat.current))
}
