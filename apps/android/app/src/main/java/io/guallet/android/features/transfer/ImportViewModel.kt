package io.guallet.android.features.transfer

import android.content.ContentResolver
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.guallet.android.core.state.apiError
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

class ImportViewModel(val repository: TransferRepository) : ViewModel() {
    private val mutable = MutableStateFlow<CsvData?>(null)
    val data = mutable.asStateFlow()
    private val errors = MutableStateFlow<String?>(null)
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
                    withContext(Dispatchers.IO) {
                        val output = java.io.ByteArrayOutputStream()
                        resolver.openInputStream(uri)?.use { input ->
                            val buffer = ByteArray(8192)
                            while (true) {
                                val count = input.read(buffer)
                                if (count < 0) break
                                require(output.size() + count <= 5 * 1024 * 1024) {
                                    "Choose a CSV file smaller than 5 MB."
                                }
                                output.write(buffer, 0, count)
                            }
                        } ?: throw IllegalArgumentException("Could not open this document.")
                        CsvParser.parse(output.toString("UTF-8"))
                    }
            } catch (failure: Exception) {
                errors.value = errorMessage(failure)
            } finally {
                processing.value = false
            }
        }
    }

    fun submit(request: ImportRequest) {
        if (processing.value) return
        processing.value = true
        errors.value = null
        viewModelScope.launch {
            try {
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
                            jobState.value = result
                            if (result.status in listOf("completed", "failed")) break
                            delay(2000)
                        }
                    }
                } catch (_: TimeoutCancellationException) {
                    errors.value = "This import is still running. Check its status again later."
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
