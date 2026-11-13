package io.guallet.android.features.transfer

import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.guallet.android.features.finance.presentation.FinanceViewModel
import io.guallet.android.features.transactions.presentation.transactionDate
import io.guallet.android.ui.components.*

@Composable
fun ImportScreen(
    model: ImportViewModel,
    finance: FinanceViewModel,
    onBack: () -> Unit,
    result: (String) -> Unit,
) {
    val data by model.data.collectAsStateWithLifecycle()
    val busy by model.busy.collectAsStateWithLifecycle()
    val error by model.error.collectAsStateWithLifecycle()
    val jobId by model.jobId.collectAsStateWithLifecycle()
    val accounts by finance.accounts.state.collectAsStateWithLifecycle()
    val categories by finance.categories.state.collectAsStateWithLifecycle()
    val settings by finance.settings.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val picker =
        rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
            uri?.let { model.read(context.contentResolver, it) }
        }
    var step by rememberSaveable { mutableIntStateOf(0) }
    var mappings by rememberSaveable { mutableStateOf(mapOf<String, String>()) }
    var accountMappings by rememberSaveable { mutableStateOf(mapOf<String, String>()) }
    var accountNames by rememberSaveable { mutableStateOf(mapOf<String, String>()) }
    var categoryMappings by rememberSaveable { mutableStateOf(mapOf<String, String>()) }
    var categoryNames by rememberSaveable { mutableStateOf(mapOf<String, String>()) }
    var validation by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(Unit) {
        finance.loadAccounts()
        finance.loadCategories()
        finance.loadSettings()
    }
    LaunchedEffect(data, busy) { if (data == null && !busy) step = 0 }
    LaunchedEffect(jobId) { jobId?.let { result(it) } }
    val fields =
        FieldMappings(
            mappings["account"].orEmpty(),
            mappings["date"].orEmpty(),
            mappings["amount"].orEmpty(),
            mappings["description"].orEmpty(),
            mappings["notes"].orEmpty(),
            mappings["category"].orEmpty(),
        )
    val rows = data?.rows.orEmpty()
    val accountKeys =
        (rows.map { it[fields.account].orEmpty().trim().ifBlank { "default" } }).distinct()
    val categoryKeys =
        rows.map { it[fields.category].orEmpty().trim() }.filter { it.isNotBlank() }.distinct()
    val validRows = rows.filter { CsvParser.rowErrors(it, fields).isEmpty() }
    val back =
        rememberFormBackHandler(data != null, busy) {
            model.reset()
            onBack()
        }
    BackHandler(step > 0 && !busy) {
        step--
        validation = null
    }
    FinancePage(
        "Import CSV · Step ${step + 1} of 5",
        {
            if (!busy && step > 0) {
                step--
                validation = null
            } else back()
        },
    ) {
        Text("Choose file → Map columns → Accounts → Categories → Preview")
        if (busy) LinearProgressIndicator(Modifier.fillMaxWidth())
        error?.let { ErrorNotice(it) }
        validation?.let { ErrorNotice(it) }
        when (step) {
            0 -> {
                Text(
                    "Choose a CSV file up to 5 MB. Your document stays on the device until you submit the preview."
                )
                Button(
                    enabled = !busy,
                    onClick = {
                        picker.launch(
                            arrayOf("text/*", "application/csv", "application/vnd.ms-excel")
                        )
                    },
                ) {
                    Text("Choose CSV file")
                }
                data?.let {
                    Text("${it.rows.size} rows · ${it.columns.size} columns")
                    Button(
                        enabled = !busy,
                        onClick = {
                            mappings = emptyMap()
                            accountMappings = emptyMap()
                            categoryMappings = emptyMap()
                            step = 1
                        },
                    ) {
                        Text("Map columns")
                    }
                }
            }
            1 ->
                data?.let { csv ->
                    listOf(
                            "date" to "Date (required)",
                            "amount" to "Amount (required)",
                            "description" to "Description (required)",
                            "account" to "Account",
                            "category" to "Category",
                            "notes" to "Notes",
                        )
                        .forEach { (key, label) ->
                            ChoiceField(
                                label,
                                mappings[key],
                                listOf("" to "Not mapped") + csv.columns.map { it to it },
                                !busy,
                            ) {
                                mappings = mappings + (key to it)
                                validation = null
                            }
                        }
                    Button(
                        enabled = !busy,
                        onClick = {
                            val chosen = mappings.values.filter { it.isNotBlank() }
                            validation =
                                when {
                                    listOf(fields.date, fields.amount, fields.description).any {
                                        it.isBlank()
                                    } -> "Map date, amount and description."
                                    chosen.distinct().size != chosen.size ->
                                        "Map each CSV column only once."
                                    fields.account.isNotBlank() &&
                                        rows.any { it[fields.account].isNullOrBlank() } &&
                                        rows.any { it[fields.account]?.trim() == "default" } ->
                                        "Rename blank account values or the account named default in the CSV."
                                    else -> null
                                }
                            if (validation == null) step = 2
                        },
                    ) {
                        Text("Continue to accounts")
                    }
                }
            2 ->
                RemoteContent(accounts, finance::loadAccounts) { existing ->
                    accountKeys.forEach { key ->
                        FinanceCard {
                            Text(if (key == "default") "Rows without an account" else key)
                            ChoiceField(
                                "Account",
                                accountMappings[key],
                                existing.map { it.id to it.name } +
                                    listOf("__create__" to "Create new account"),
                                !busy,
                            ) {
                                accountMappings = accountMappings + (key to it)
                            }
                            if (accountMappings[key] == "__create__")
                                TextField(
                                    "New account name",
                                    accountNames[key]
                                        ?: if (key == "default") "Imported account" else key,
                                    !busy,
                                    onChange = { accountNames = accountNames + (key to it) },
                                )
                        }
                    }
                    Button(
                        enabled = !busy,
                        onClick = {
                            if (
                                accountKeys.any { key ->
                                    accountMappings[key].isNullOrBlank() ||
                                        (accountMappings[key] == "__create__" &&
                                            accountNames[key]?.isBlank() == true)
                                }
                            )
                                validation = "Map every account before continuing."
                            else {
                                validation = null
                                step = 3
                            }
                        },
                    ) {
                        Text("Continue to categories")
                    }
                }
            3 ->
                RemoteContent(categories, finance::loadCategories) { existing ->
                    if (categoryKeys.isEmpty()) Text("No categories to map.")
                    categoryKeys.forEach { key ->
                        FinanceCard {
                            Text(key)
                            ChoiceField(
                                "Category",
                                categoryMappings[key],
                                listOf(
                                    "__ignore__" to "Leave uncategorised",
                                    "__create__" to "Create new category",
                                ) + existing.map { it.id to it.name },
                                !busy,
                            ) {
                                categoryMappings = categoryMappings + (key to it)
                            }
                            if (categoryMappings[key] == "__create__")
                                TextField(
                                    "New category name",
                                    categoryNames[key] ?: key,
                                    !busy,
                                    onChange = { categoryNames = categoryNames + (key to it) },
                                )
                        }
                    }
                    Button(
                        enabled = !busy,
                        onClick = {
                            if (
                                categoryKeys.any { key ->
                                    categoryMappings[key].isNullOrBlank() ||
                                        (categoryMappings[key] == "__create__" &&
                                            categoryNames[key]?.isBlank() == true)
                                }
                            )
                                validation = "Map every category or choose leave uncategorised."
                            else {
                                validation = null
                                step = 4
                            }
                        },
                    ) {
                        Text("Preview import")
                    }
                }
            4 -> {
                Text(
                    "${validRows.size} valid rows. ${rows.size - validRows.size} invalid rows will be skipped."
                )
                rows.take(5).forEachIndexed { index, row ->
                    FinanceCard {
                        Text("Row ${index + 1}: ${row[fields.description].orEmpty()}")
                        Text(row[fields.date].orEmpty())
                        val key = row[fields.account].orEmpty().trim().ifBlank { "default" }
                        val accountId = accountMappings[key]
                        val previewCurrency =
                            accounts.value.orEmpty().find { it.id == accountId }?.currency
                                ?: if (accountId == "__create__" && settings.value != null)
                                    (settings.value!!.currencies.defaultCurrency ?: "GBP")
                                else null
                        val previewAmount =
                            row[fields.amount]
                                .orEmpty()
                                .trim()
                                .replace(',', '.')
                                .toBigDecimalOrNull()
                        if (previewCurrency != null && previewAmount != null)
                            MoneyLabel(previewAmount, previewCurrency)
                        else Text("Amount will use the mapped account’s currency.")
                        CsvParser.rowErrors(row, fields).forEach {
                            Text(it, color = MaterialTheme.colorScheme.error)
                        }
                    }
                }
                Text(
                    "Submitting will add transactions and create any accounts or categories you selected. This may take a few minutes."
                )
                Button(
                    enabled = !busy && validRows.isNotEmpty(),
                    onClick = {
                        val normalized =
                            validRows.map { row ->
                                row.mapValues { (column, value) ->
                                    if (
                                        column in
                                            listOf(fields.account, fields.category, fields.date)
                                    )
                                        value.trim()
                                    else value
                                }
                            }
                        val usedAccounts =
                            normalized
                                .map { it[fields.account].orEmpty().ifBlank { "default" } }
                                .distinct()
                        val usedCategories =
                            normalized
                                .map { it[fields.category].orEmpty() }
                                .filter { it.isNotBlank() }
                                .distinct()
                        val accountInput =
                            usedAccounts.associateWith { key ->
                                val selection = accountMappings.getValue(key)
                                if (selection == "__create__")
                                    AccountMapping(
                                        accountNames[key]
                                            ?: if (key == "default") "Imported account" else key,
                                        true,
                                    )
                                else
                                    AccountMapping(
                                        accounts.value.orEmpty().find { it.id == selection }?.name
                                            ?: key,
                                        false,
                                        selection,
                                    )
                            }
                        val categoryInput =
                            usedCategories
                                .filter { categoryMappings[it] != "__ignore__" }
                                .associateWith { key ->
                                    val selection = categoryMappings.getValue(key)
                                    if (selection == "__create__")
                                        CategoryMapping(categoryNames[key] ?: key, true)
                                    else
                                        CategoryMapping(
                                            categories.value
                                                .orEmpty()
                                                .find { it.id == selection }
                                                ?.name ?: key,
                                            false,
                                            selection,
                                        )
                                }
                        model.submit(ImportRequest(normalized, fields, accountInput, categoryInput))
                    },
                ) {
                    Text("Import valid rows")
                }
            }
        }
    }
}

@Composable
fun ImportResultScreen(
    id: String,
    model: ImportViewModel,
    finance: FinanceViewModel,
    onBack: () -> Unit,
) {
    val status by model.status.collectAsStateWithLifecycle()
    val error by model.error.collectAsStateWithLifecycle()
    LaunchedEffect(id) { model.poll(id) }
    DisposableEffect(id) { onDispose { model.stopPolling() } }
    LaunchedEffect(status?.status) {
        if (status?.status == "completed") {
            finance.loadAccounts()
            finance.loadCategories()
            finance.loadTransactions()
        }
    }
    BackHandler {
        model.reset()
        onBack()
    }
    FinancePage(
        "Import status",
        {
            model.reset()
            onBack()
        },
    ) {
        Text("Job: $id")
        error?.let { ErrorNotice(it) { model.poll(id) } }
        val state = status
        if (state == null && error == null) CircularProgressIndicator()
        state?.let {
            Text(it.status.replaceFirstChar(Char::uppercaseChar))
            LinearProgressIndicator(
                progress = { (it.progress / 100).toFloat().coerceIn(0f, 1f) },
                modifier = Modifier.fillMaxWidth(),
            )
            Text("${it.processedCount} processed · ${it.failedCount} failed")
            it.error?.let { message -> ErrorNotice(message) }
            if (it.status !in listOf("completed", "failed"))
                Text("Leaving this screen does not cancel the import.")
        }
        TextButton(
            onClick = {
                model.reset()
                onBack()
            }
        ) {
            Text("Back to settings")
        }
    }
}

@Composable
fun ExportScreen(finance: FinanceViewModel, repository: TransferRepository, onBack: () -> Unit) {
    val accounts by finance.accounts.state.collectAsStateWithLifecycle()
    val mutation by finance.mutation.collectAsStateWithLifecycle()
    var selected by rememberSaveable { mutableStateOf(emptyList<String>()) }
    var start by rememberSaveable { mutableStateOf("") }
    var end by rememberSaveable { mutableStateOf("") }
    var format by rememberSaveable { mutableStateOf("csv") }
    var accepted by rememberSaveable { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(Unit) {
        finance.clearMutation()
        finance.loadAccounts()
    }
    LaunchedEffect(mutation.completed) {
        if (mutation.completed) {
            accepted = true
            finance.clearMutation()
        }
    }
    FinancePage("Export data", onBack) {
        if (accepted) {
            Text(
                "Your export request was accepted. It has been queued; this does not mean the export has finished."
            )
            Button(onClick = { accepted = false }) { Text("Request another export") }
        } else {
            Text("Leave accounts and dates empty to export all available data.")
            RemoteContent(accounts, finance::loadAccounts) { items ->
                MultiChoice(
                    "Accounts",
                    selected.toSet(),
                    items.map { it.id to it.name },
                    !mutation.busy,
                ) {
                    selected = it.toList()
                }
            }
            ChoiceField(
                "Format",
                format,
                listOf("csv" to "CSV", "ofe" to "OFE", "json" to "JSON"),
                !mutation.busy,
            ) {
                format = it
            }
            TextField(
                "Start date (YYYY-MM-DD, optional)",
                start,
                !mutation.busy,
                onChange = {
                    start = it
                    error = null
                },
            )
            TextField(
                "End date (YYYY-MM-DD, optional)",
                end,
                !mutation.busy,
                onChange = {
                    end = it
                    error = null
                },
            )
            error?.let { ErrorNotice(it) }
            MutationFeedback(mutation)
            Button(
                enabled = !mutation.busy,
                onClick = {
                    try {
                        val from = start.takeIf { it.isNotBlank() }?.let { transactionDate(it) }
                        val to = end.takeIf { it.isNotBlank() }?.let { transactionDate(it, true) }
                        require(from == null || to == null || from <= to)
                        val request =
                            ExportRequest(
                                format,
                                selected.takeIf { it.isNotEmpty() }?.toList(),
                                from,
                                to,
                            )
                        finance.mutate { repository.export(request) }
                    } catch (_: Exception) {
                        error = "Enter valid dates and an end date on or after the start date."
                    }
                },
            ) {
                Text("Request export")
            }
        }
    }
}
