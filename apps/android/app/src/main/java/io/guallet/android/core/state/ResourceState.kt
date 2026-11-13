package io.guallet.android.core.state

import io.guallet.android.R
import io.guallet.android.core.state.*
import io.ktor.client.plugins.ResponseException
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

data class ResourceState<T>(
    val value: T? = null,
    val loading: Boolean = false,
    val error: UiMessage? = null,
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

fun apiError(error: Exception, onUnauthorized: () -> Unit = {}): UiMessage {
    if (error is CancellationException) throw error
    if (error is UiMessageException) return error.text
    if (error is IllegalArgumentException)
        return error.message?.let(UiMessage::Text) ?: uiMessage(R.string.message_check_your_details)
    if (error is ResponseException)
        return when (error.response.status.value) {
            401 -> {
                onUnauthorized()
                uiMessage(R.string.message_your_session_has_expired_please_log_in_again)
            }
            403 -> uiMessage(R.string.message_you_do_not_have_permission_to_perform_this_action)
            404 -> uiMessage(R.string.message_this_item_is_no_longer_available)
            409 -> uiMessage(R.string.message_this_item_cannot_be_changed_while_linked_data_exists)
            400,
            422 -> uiMessage(R.string.message_check_your_details_and_try_again)
            429 -> uiMessage(R.string.message_too_many_requests_wait_a_moment_and_try_again)
            else ->
                uiMessage(
                    R.string.message_the_server_could_not_complete_the_request_please_try_again
                )
        }
    return uiMessage(R.string.message_could_not_connect_check_your_connection_and_try_again)
}
