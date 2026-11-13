package io.guallet.android.features.transfer

import io.guallet.android.R
import io.guallet.android.core.state.*
import java.time.*
import java.time.format.DateTimeFormatter
import java.time.format.ResolverStyle

object CsvParser {
    fun parse(content: String): CsvData {
        val text = content.removePrefix("\uFEFF")
        fun rows(delimiter: Char): List<List<String>> {
            val result = mutableListOf<List<String>>()
            var row = mutableListOf<String>()
            val field = StringBuilder()
            var quoted = false
            var closed = false
            var i = 0
            fun endField() {
                row.add(field.toString())
                field.clear()
                closed = false
            }
            fun endRow() {
                endField()
                if (row.any { it.isNotBlank() }) result.add(row)
                row = mutableListOf()
            }
            while (i < text.length) {
                val ch = text[i]
                when {
                    quoted && ch == '"' && i + 1 < text.length && text[i + 1] == '"' -> {
                        field.append('"')
                        i++
                    }
                    ch == '"' && quoted -> {
                        quoted = false
                        closed = true
                    }
                    ch == '"' && field.isEmpty() && !closed -> quoted = true
                    quoted -> field.append(ch)
                    ch == delimiter -> endField()
                    ch == '\n' || ch == '\r' -> {
                        if (ch == '\r' && i + 1 < text.length && text[i + 1] == '\n') i++
                        endRow()
                    }
                    closed && !ch.isWhitespace() ->
                        throw UiMessageException(
                            uiMessage(
                                R.string.message_unexpected_characters_after_a_quoted_csv_field
                            )
                        )
                    !closed -> field.append(ch)
                }
                i++
            }
            require(!quoted) {
                throw UiMessageException(
                    uiMessage(R.string.message_csv_contains_an_unclosed_quoted_field)
                )
            }
            if (field.isNotEmpty() || row.isNotEmpty()) endRow()
            return result
        }
        // Detect only outside quotes, using the complete header row.
        var quoted = false
        val counts = mutableMapOf(',' to 0, ';' to 0, '\t' to 0)
        for (ch in text) {
            if (ch == '"') quoted = !quoted
            if (!quoted && (ch == '\n' || ch == '\r')) break
            if (!quoted && ch in counts) counts[ch] = counts.getValue(ch) + 1
        }
        val delimiter = counts.maxByOrNull { it.value }!!.key
        val parsed = rows(delimiter)
        require(parsed.size >= 2) {
            throw UiMessageException(
                uiMessage(R.string.message_this_csv_has_no_headers_or_transaction_rows)
            )
        }
        val headers = parsed.first()
        require(headers.none { it.isBlank() } && headers.distinct().size == headers.size) {
            throw UiMessageException(
                uiMessage(R.string.message_csv_column_names_must_be_non_empty_and_unique)
            )
        }
        require(parsed.drop(1).all { it.size == headers.size }) {
            throw UiMessageException(
                uiMessage(
                    R.string.message_csv_rows_must_have_the_same_number_of_columns_as_the_header
                )
            )
        }
        return CsvData(headers, parsed.drop(1).map { headers.zip(it).toMap() })
    }

    fun validDate(text: String): Boolean {
        val value = text.trim()
        if (
            runCatching {
                    OffsetDateTime.parse(value.replace(' ', 'T'))
                    true
                }
                .getOrDefault(false)
        )
            return true
        if (
            runCatching {
                    LocalDateTime.parse(value.replace(' ', 'T'))
                    true
                }
                .getOrDefault(false)
        )
            return true
        return listOf(
                "uuuu-MM-dd",
                "dd/MM/uuuu",
                "MM/dd/uuuu",
                "dd-MM-uuuu",
                "uuuu/MM/dd",
                "dd.MM.uuuu",
            )
            .any { pattern ->
                runCatching {
                        LocalDate.parse(
                            value,
                            DateTimeFormatter.ofPattern(pattern)
                                .withResolverStyle(ResolverStyle.STRICT),
                        )
                        true
                    }
                    .getOrDefault(false)
            }
    }

    fun rowErrors(row: Map<String, String>, fields: FieldMappings): List<UiMessage> = buildList {
        if (!validDate(row[fields.date].orEmpty())) add(uiMessage(R.string.message_invalid_date))
        val amount = row[fields.amount].orEmpty().trim().replace(',', '.')
        val decimal = amount.toBigDecimalOrNull()
        if (
            decimal == null ||
                decimal.abs() > java.math.BigDecimal(java.lang.Double.MAX_VALUE.toString())
        )
            add(uiMessage(R.string.message_invalid_amount))
        if (row[fields.description].isNullOrBlank())
            add(uiMessage(R.string.message_missing_description))
    }
}
