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
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.repeatOnLifecycle
import io.guallet.android.R
import io.guallet.android.core.state.*
import io.guallet.android.features.finance.presentation.FinanceViewModel
import io.guallet.android.features.transactions.presentation.transactionDate
import io.guallet.android.ui.components.*
import kotlinx.coroutines.awaitCancellation

@Composable
fun ImportScreen(
    model: ImportViewModel,
    finance: FinanceViewModel,
    onBack: () -> Unit,
    result: (String) -> Unit,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current

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
    val prepared by
        produceState<CsvPreparation?>(null, data, fields) {
            value = null
            data?.let { value = model.prepare(it, fields) }
        }
    val accountKeys = prepared?.accountKeys.orEmpty()
    val categoryKeys = prepared?.categoryKeys.orEmpty()
    val validRows = prepared?.validRows.orEmpty()
    val back =
        rememberFormBackHandler(data != null, busy) {
            model.reset()
            onBack()
        }
    BackHandler(step > 0 && !busy) {
        step--
        validation = null
    }
    FinanceListPage(
        resources.getString(R.string.import_csv_step_value_of_5, step + 1),
        {
            if (!busy && step > 0) {
                step--
                validation = null
            } else back()
        },
    ) {
        item("import-controls") {
            Column(
                verticalArrangement =
                    Arrangement.spacedBy(io.guallet.android.ui.theme.GualletTokens.small)
            ) {
                Text(
                    resources.getString(
                        R.string.choose_file_map_columns_accounts_categories_preview
                    )
                )
                if (busy || (data != null && prepared == null))
                    LinearProgressIndicator(Modifier.fillMaxWidth())
                error?.let { ErrorNotice(it) }
                validation?.let { ErrorNotice(it) }
            }
        }
        when (step) {
            0 ->
                item("file") {
                    Column {
                        Text(
                            resources.getString(
                                R.string
                                    .choose_a_csv_file_up_to_5_mb_your_document_stays_on_the_device_until_you_submit_the_prev
                            )
                        )
                        Button(
                            enabled = !busy,
                            onClick = {
                                picker.launch(
                                    arrayOf("text/*", "application/csv", "application/vnd.ms-excel")
                                )
                            },
                        ) {
                            Text(resources.getString(R.string.choose_csv_file))
                        }
                        data?.let {
                            Text(
                                resources.getString(
                                    R.string.csv_dimensions,
                                    resources.getQuantityString(
                                        R.plurals.csv_row_count,
                                        it.rows.size,
                                        it.rows.size,
                                    ),
                                    resources.getQuantityString(
                                        R.plurals.csv_column_count,
                                        it.columns.size,
                                        it.columns.size,
                                    ),
                                )
                            )
                            Button(
                                enabled = !busy,
                                onClick = {
                                    mappings = emptyMap()
                                    accountMappings = emptyMap()
                                    categoryMappings = emptyMap()
                                    accountNames = emptyMap()
                                    categoryNames = emptyMap()
                                    step = 1
                                },
                            ) {
                                Text(resources.getString(R.string.map_columns))
                            }
                        }
                    }
                }
            1 ->
                data?.let { csv ->
                    item("columns") {
                        Column {
                            listOf(
                                    "date" to resources.getString(R.string.date_required),
                                    "amount" to resources.getString(R.string.amount_required),
                                    "description" to
                                        resources.getString(R.string.description_required),
                                    "account" to resources.getString(R.string.account),
                                    "category" to resources.getString(R.string.category),
                                    "notes" to resources.getString(R.string.notes),
                                )
                                .forEach { (key, label) ->
                                    ChoiceField(
                                        label,
                                        mappings[key],
                                        listOf("" to resources.getString(R.string.not_mapped)) +
                                            csv.columns.map { it to it },
                                        !busy,
                                    ) {
                                        mappings = mappings + (key to it)
                                        validation = null
                                    }
                                }
                            Button(
                                enabled = !busy && prepared != null,
                                onClick = {
                                    validation = prepared?.mappingError?.resolve(resources)
                                    if (prepared == null)
                                        validation =
                                            resources.getString(
                                                R.string.preparing_csv_preview_please_wait
                                            )
                                    if (validation == null) step = 2
                                },
                            ) {
                                Text(resources.getString(R.string.continue_to_accounts))
                            }
                        }
                    }
                }
            2 ->
                remoteItems(accounts, finance::loadAccounts) { existing ->
                    items(accountKeys.size, key = { "account-${accountKeys[it]}" }) { index ->
                        val key = accountKeys[index]
                        FinanceCard {
                            Text(
                                if (key == "default")
                                    resources.getString(R.string.rows_without_an_account)
                                else key
                            )
                            ChoiceField(
                                resources.getString(R.string.account),
                                accountMappings[key],
                                existing.map { it.id to it.name } +
                                    listOf(
                                        "__create__" to
                                            resources.getString(R.string.create_new_account)
                                    ),
                                !busy,
                            ) {
                                accountMappings = accountMappings + (key to it)
                            }
                            if (accountMappings[key] == "__create__")
                                TextField(
                                    resources.getString(R.string.new_account_name),
                                    accountNames[key]
                                        ?: if (key == "default")
                                            resources.getString(R.string.imported_account)
                                        else key,
                                    !busy,
                                    onChange = { accountNames = accountNames + (key to it) },
                                )
                        }
                    }
                    item("accounts-continue") {
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
                                    validation =
                                        resources.getString(
                                            R.string.map_every_account_before_continuing
                                        )
                                else {
                                    validation = null
                                    step = 3
                                }
                            },
                        ) {
                            Text(resources.getString(R.string.continue_to_categories))
                        }
                    }
                }
            3 ->
                remoteItems(categories, finance::loadCategories) { existing ->
                    if (categoryKeys.isEmpty())
                        item("no-categories") {
                            Text(resources.getString(R.string.no_categories_to_map))
                        }
                    items(categoryKeys.size, key = { "category-${categoryKeys[it]}" }) { index ->
                        val key = categoryKeys[index]
                        FinanceCard {
                            Text(key)
                            ChoiceField(
                                resources.getString(R.string.category),
                                categoryMappings[key],
                                listOf(
                                    "__ignore__" to
                                        resources.getString(R.string.leave_uncategorised),
                                    "__create__" to
                                        resources.getString(R.string.create_new_category),
                                ) + existing.map { it.id to it.name },
                                !busy,
                            ) {
                                categoryMappings = categoryMappings + (key to it)
                            }
                            if (categoryMappings[key] == "__create__")
                                TextField(
                                    resources.getString(R.string.new_category_name),
                                    categoryNames[key] ?: key,
                                    !busy,
                                    onChange = { categoryNames = categoryNames + (key to it) },
                                )
                        }
                    }
                    item("categories-continue") {
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
                                    validation =
                                        resources.getString(
                                            R.string
                                                .map_every_category_or_choose_leave_uncategorised
                                        )
                                else {
                                    validation = null
                                    step = 4
                                }
                            },
                        ) {
                            Text(resources.getString(R.string.preview_import))
                        }
                    }
                }
            4 ->
                item("preview") {
                    Column(
                        verticalArrangement =
                            Arrangement.spacedBy(io.guallet.android.ui.theme.GualletTokens.gutter)
                    ) {
                        Text(
                            resources.getString(
                                R.string.csv_validation_summary,
                                resources.getQuantityString(
                                    R.plurals.valid_row_count,
                                    validRows.size,
                                    validRows.size,
                                ),
                                resources.getQuantityString(
                                    R.plurals.invalid_row_count,
                                    rows.size - validRows.size,
                                    rows.size - validRows.size,
                                ),
                            )
                        )
                        rows.take(5).forEachIndexed { index, row ->
                            FinanceCard {
                                Text(
                                    resources.getString(
                                        R.string.row_value_value,
                                        index + 1,
                                        row[fields.description].orEmpty(),
                                    )
                                )
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
                                else
                                    Text(
                                        resources.getString(
                                            R.string.amount_will_use_the_mapped_account_s_currency
                                        )
                                    )
                                prepared?.previewErrors?.getOrNull(index).orEmpty().forEach {
                                    Text(
                                        it.resolve(resources),
                                        color = MaterialTheme.colorScheme.error,
                                    )
                                }
                            }
                        }
                        Text(
                            resources.getString(
                                R.string
                                    .submitting_will_add_transactions_and_create_any_accounts_or_categories_you_selected_this
                            )
                        )
                        Button(
                            enabled = !busy && validRows.isNotEmpty(),
                            onClick = {
                                prepared?.let { preview ->
                                    model.submit(
                                        preview,
                                        accountMappings,
                                        accountNames,
                                        categoryMappings,
                                        categoryNames,
                                        accounts.value.orEmpty().associate { it.id to it.name },
                                        categories.value.orEmpty().associate { it.id to it.name },
                                        resources.getString(R.string.imported_account),
                                    )
                                }
                            },
                        ) {
                            Text(resources.getString(R.string.import_valid_rows))
                        }
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
    val resources = androidx.compose.ui.platform.LocalResources.current

    val status by model.status.collectAsStateWithLifecycle()
    val error by model.error.collectAsStateWithLifecycle()
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    LaunchedEffect(id, lifecycle) {
        lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
            model.poll(id)
            try {
                awaitCancellation()
            } finally {
                model.stopPolling()
            }
        }
    }
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
        resources.getString(R.string.import_status),
        {
            model.reset()
            onBack()
        },
    ) {
        Text(resources.getString(R.string.job_value, id))
        error?.let { ErrorNotice(it) { model.poll(id) } }
        val state = status
        if (state == null && error == null) CircularProgressIndicator()
        state?.let {
            Text(
                when (it.status) {
                    "waiting",
                    "pending",
                    "queued" -> resources.getString(R.string.import_queued)
                    "active",
                    "processing" -> resources.getString(R.string.import_processing)
                    "completed" -> resources.getString(R.string.import_completed)
                    "failed" -> resources.getString(R.string.import_failed)
                    else -> it.status
                }
            )
            LinearProgressIndicator(
                progress = { (it.progress / 100).toFloat().coerceIn(0f, 1f) },
                modifier = Modifier.fillMaxWidth(),
            )
            Text(
                resources.getString(
                    R.string.value_processed_value_failed,
                    it.processedCount,
                    it.failedCount,
                )
            )
            it.error?.let { message -> ErrorNotice(message) }
            if (it.status !in listOf("completed", "failed"))
                Text(resources.getString(R.string.leaving_this_screen_does_not_cancel_the_import))
        }
        TextButton(
            onClick = {
                model.reset()
                onBack()
            }
        ) {
            Text(resources.getString(R.string.back_to_settings))
        }
    }
}

@Composable
fun ExportScreen(finance: FinanceViewModel, repository: TransferRepository, onBack: () -> Unit) {
    val resources = androidx.compose.ui.platform.LocalResources.current

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
    FinancePage(resources.getString(R.string.export_data), onBack) {
        if (accepted) {
            Text(
                resources.getString(
                    R.string
                        .your_export_request_was_accepted_it_has_been_queued_this_does_not_mean_the_export_has_fi
                )
            )
            Button(onClick = { accepted = false }) {
                Text(resources.getString(R.string.request_another_export))
            }
        } else {
            Text(
                resources.getString(
                    R.string.leave_accounts_and_dates_empty_to_export_all_available_data
                )
            )
            RemoteContent(accounts, finance::loadAccounts) { items ->
                MultiChoice(
                    resources.getString(R.string.accounts),
                    selected.toSet(),
                    items.map { it.id to it.name },
                    !mutation.busy,
                ) {
                    selected = it.toList()
                }
            }
            ChoiceField(
                resources.getString(R.string.format),
                format,
                listOf("csv" to "CSV", "ofe" to "OFE", "json" to "JSON"),
                !mutation.busy,
            ) {
                format = it
            }
            TextField(
                resources.getString(R.string.start_date_yyyy_mm_dd_optional),
                start,
                !mutation.busy,
                onChange = {
                    start = it
                    error = null
                },
            )
            TextField(
                resources.getString(R.string.end_date_yyyy_mm_dd_optional),
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
                        error =
                            resources.getString(
                                R.string
                                    .enter_valid_dates_and_an_end_date_on_or_after_the_start_date
                            )
                    }
                },
            ) {
                Text(resources.getString(R.string.request_export))
            }
        }
    }
}
