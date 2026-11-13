package io.guallet.android.features.transfer

import io.guallet.android.R
import io.guallet.android.core.state.*
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive

/** Prepared off Main once per column mapping; composition only reads bounded previews. */
data class CsvPreparation(
    val fields: FieldMappings,
    val accountKeys: List<String>,
    val categoryKeys: List<String>,
    val validRows: List<Map<String, String>>,
    val usedAccountKeys: Set<String>,
    val usedCategoryKeys: Set<String>,
    val previewErrors: List<List<UiMessage>>,
    val mappingError: UiMessage? = null,
)

suspend fun prepareCsv(data: CsvData, fields: FieldMappings): CsvPreparation {
    val selected =
        listOf(
                fields.date,
                fields.amount,
                fields.description,
                fields.account,
                fields.category,
                fields.notes,
            )
            .filter { it.isNotBlank() }
    val mappingError =
        when {
            listOf(fields.date, fields.amount, fields.description).any { it.isBlank() } ->
                uiMessage(R.string.message_map_date_amount_and_description)
            selected.distinct().size != selected.size ->
                uiMessage(R.string.message_map_each_csv_column_only_once)
            selected.any { it !in data.columns } ->
                uiMessage(R.string.message_choose_columns_from_the_current_csv)
            else -> null
        }
    if (mappingError != null)
        return CsvPreparation(
            fields,
            emptyList(),
            emptyList(),
            emptyList(),
            emptySet(),
            emptySet(),
            emptyList(),
            mappingError,
        )
    val accountKeys = linkedSetOf<String>()
    val categoryKeys = linkedSetOf<String>()
    val usedAccounts = linkedSetOf<String>()
    val usedCategories = linkedSetOf<String>()
    val valid = mutableListOf<Map<String, String>>()
    val previews = mutableListOf<List<UiMessage>>()
    var blankAccount = false
    var namedDefault = false
    data.rows.forEachIndexed { index, row ->
        if (index % 128 == 0) currentCoroutineContext().ensureActive()
        val account = row[fields.account].orEmpty().trim()
        if (account.isBlank()) blankAccount = true
        if (account == "default") namedDefault = true
        val accountKey = account.ifBlank { "default" }
        val category = row[fields.category].orEmpty().trim()
        accountKeys.add(accountKey)
        if (category.isNotBlank()) categoryKeys.add(category)
        val errors = CsvParser.rowErrors(row, fields)
        if (index < 5) previews.add(errors)
        if (errors.isEmpty()) {
            valid.add(
                row.mapValues { (column, value) ->
                    if (column in listOf(fields.account, fields.category, fields.date)) value.trim()
                    else value
                }
            )
            usedAccounts.add(accountKey)
            if (category.isNotBlank()) usedCategories.add(category)
        }
    }
    return CsvPreparation(
        fields,
        accountKeys.toList(),
        categoryKeys.toList(),
        valid,
        usedAccounts,
        usedCategories,
        previews,
        if (fields.account.isNotBlank() && blankAccount && namedDefault)
            uiMessage(
                R.string.message_rename_blank_account_values_or_the_account_named_default_in_the_csv
            )
        else null,
    )
}
