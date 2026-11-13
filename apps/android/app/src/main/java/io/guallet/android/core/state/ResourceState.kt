package io.guallet.android.core.state

import io.ktor.client.plugins.ResponseException
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

data class ResourceState<T>(
    val value: T? = null,
    val loading: Boolean = false,
    val error: String? = null,
    val requestKey: Any? = null,
)

class RemoteResource<T>(private val scope: CoroutineScope, private val onUnauthorized: () -> Unit) {
    private val mutable = MutableStateFlow(ResourceState<T>())
    val state = mutable.asStateFlow()
    private var job: Job? = null

    fun load(key: Any = Unit, loader: suspend () -> T) {
        job?.cancel()
        mutable.update {
            ResourceState(
                value = it.value.takeIf { _ -> it.requestKey == key },
                loading = true,
                requestKey = key,
            )
        }
        job =
            scope.launch {
                try {
                    val result = loader()
                    ensureActive()
                    mutable.update { it.copy(value = result) }
                } catch (error: Exception) {
                    ensureActive()
                    val message = apiError(error, onUnauthorized)
                    mutable.update { it.copy(error = message) }
                } finally {
                    if (isActive) mutable.update { it.copy(loading = false) }
                }
            }
    }
}

fun apiError(error: Exception, onUnauthorized: () -> Unit = {}): String {
    if (error is CancellationException) throw error
    if (error is IllegalArgumentException) return error.message ?: "Check your details."
    if (error is ResponseException)
        return when (error.response.status.value) {
            401 -> {
                onUnauthorized()
                "Your session has expired. Please log in again."
            }
            403 -> "You do not have permission to perform this action."
            404 -> "This item is no longer available."
            409 -> "This item cannot be changed while linked data exists."
            400,
            422 -> "Check your details and try again."
            429 -> "Too many requests. Wait a moment and try again."
            else -> "The server could not complete the request. Please try again."
        }
    return "Could not connect. Check your connection and try again."
}
