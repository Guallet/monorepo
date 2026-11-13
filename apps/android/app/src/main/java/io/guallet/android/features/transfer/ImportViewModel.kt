package io.guallet.android.features.transfer

import android.content.ContentResolver
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.guallet.android.R
import io.guallet.android.core.state.*
import io.guallet.android.core.state.apiError
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

class ImportViewModel(
    val repository: TransferRepository,
    private val dispatchers: io.guallet.android.core.state.AppDispatchers =
        io.guallet.android.core.state.AppDispatchers(),
) : ViewModel() {
    private val mutable = MutableStateFlow<CsvData?>(null)
    val data = mutable.asStateFlow()
    private val errors = MutableStateFlow<UiMessage?>(null)
    val error = errors.asStateFlow()
    private val processing = MutableStateFlow(false)
    val busy = processing.asStateFlow()
    private val expired = MutableStateFlow(false)
    val unauthorized = expired.asStateFlow()

    private fun errorMessage(error: Exception) = apiError(error) { expired.value = true }

    private val accepted = MutableStateFlow<String?>(null)
    val jobId = accepted.asStateFlow()
    private val jobState = MutableStateFlow<ImportStatus?>(null)
    val status = jobState.asStateFlow()
    private var pollJob: Job? = null

    fun read(resolver: ContentResolver, uri: Uri) {
        if (processing.value) return
        processing.value = true
        errors.value = null
        mutable.value = null
        viewModelScope.launch {
            try {
                mutable.value =
                    withContext(dispatchers.io) {
                        val output = java.io.ByteArrayOutputStream()
                        resolver.openInputStream(uri)?.use { input ->
                            val buffer = ByteArray(8192)
                            while (true) {
                                val count = input.read(buffer)
                                if (count < 0) break
                                require(output.size() + count <= 5 * 1024 * 1024) {
                                    throw UiMessageException(
                                        uiMessage(
                                            R.string.message_choose_a_csv_file_smaller_than_5_mb
                                        )
                                    )
                                }
                                output.write(buffer, 0, count)
                            }
                        }
                            ?: throw UiMessageException(
                                uiMessage(R.string.message_could_not_open_this_document)
                            )
                        CsvParser.parse(output.toString("UTF-8"))
                    }
            } catch (failure: Exception) {
                errors.value = errorMessage(failure)
            } finally {
                processing.value = false
            }
        }
    }

    suspend fun prepare(data: CsvData, fields: FieldMappings): CsvPreparation =
        withContext(dispatchers.computation) { prepareCsv(data, fields) }

    fun submit(
        prepared: CsvPreparation,
        accountSelections: Map<String, String>,
        accountNames: Map<String, String>,
        categorySelections: Map<String, String>,
        categoryNames: Map<String, String>,
        accounts: Map<String, String>,
        categories: Map<String, String>,
        defaultAccountName: String,
    ) {
        if (processing.value) return
        processing.value = true
        errors.value = null
        viewModelScope.launch {
            try {
                val request =
                    withContext(dispatchers.computation) {
                        require(prepared.mappingError == null && prepared.validRows.isNotEmpty())
                        val accountInput =
                            prepared.usedAccountKeys.associateWith { key ->
                                val selection = accountSelections.getValue(key)
                                if (selection == "__create__")
                                    AccountMapping(
                                        accountNames[key]
                                            ?: if (key == "default") defaultAccountName else key,
                                        true,
                                    )
                                else AccountMapping(accounts.getValue(selection), false, selection)
                            }
                        val categoryInput =
                            prepared.usedCategoryKeys
                                .filter { categorySelections[it] != "__ignore__" }
                                .associateWith { key ->
                                    val selection = categorySelections.getValue(key)
                                    if (selection == "__create__")
                                        CategoryMapping(categoryNames[key] ?: key, true)
                                    else
                                        CategoryMapping(
                                            categories.getValue(selection),
                                            false,
                                            selection,
                                        )
                                }
                        ImportRequest(
                            prepared.validRows,
                            prepared.fields,
                            accountInput,
                            categoryInput,
                        )
                    }
                accepted.value = repository.submit(request).jobId
            } catch (failure: Exception) {
                errors.value = errorMessage(failure)
            } finally {
                processing.value = false
            }
        }
    }

    fun poll(id: String) {
        pollJob?.cancel()
        errors.value = null
        jobState.value = null
        pollJob =
            viewModelScope.launch {
                try {
                    withTimeout(10 * 60 * 1000L) {
                        while (true) {
                            val result = repository.status(id)
                            ensureActive()
                            jobState.value = result
                            if (result.status in listOf("completed", "failed")) break
                            delay(2000)
                        }
                    }
                } catch (_: TimeoutCancellationException) {
                    errors.value =
                        uiMessage(
                            R.string
                                .message_this_import_is_still_running_check_its_status_again_later
                        )
                } catch (failure: Exception) {
                    errors.value = errorMessage(failure)
                }
            }
    }

    fun stopPolling() {
        pollJob?.cancel()
    }

    fun reset() {
        mutable.value = null
        accepted.value = null
        errors.value = null
        jobState.value = null
        pollJob?.cancel()
    }
}
