package io.guallet.android.features.auth.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.guallet.android.R
import io.guallet.android.core.state.*
import io.guallet.android.features.auth.data.BrowserAuthRepository
import io.guallet.android.features.auth.data.parseNativeCallback
import io.guallet.android.features.auth.domain.AuthRepository
import io.guallet.android.features.auth.domain.AuthUser
import io.ktor.client.plugins.ResponseException
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

sealed interface SessionState {
    data object Loading : SessionState

    data object SignedOut : SessionState

    data class SignedIn(val user: AuthUser) : SessionState

    data object Unavailable : SessionState
}

data class AuthUiState(
    val session: SessionState = SessionState.Loading,
    val busy: Boolean = false,
    val error: UiMessage? = null,
    val completed: Boolean = false,
    val browserUrl: String? = null,
    val resetToken: String? = null,
    val pendingResetToken: String? = null,
    val notice: UiMessage? = null,
)

class AuthViewModel(
    private val repository: AuthRepository,
    private val browser: BrowserAuthRepository? = null,
) : ViewModel() {
    private val mutableState = MutableStateFlow(AuthUiState())
    val state = mutableState.asStateFlow()

    init {
        restoreSession()
    }

    fun restoreSession() = perform {
        mutableState.update { it.copy(session = SessionState.Loading) }
        try {
            val user = repository.session()
            mutableState.update {
                it.copy(session = user?.let(SessionState::SignedIn) ?: SessionState.SignedOut)
            }
        } catch (error: Exception) {
            if (error is CancellationException) throw error
            mutableState.update { it.copy(session = SessionState.Unavailable) }
            throw error
        }
    }

    fun clearFeedback() {
        mutableState.update { it.copy(error = null, completed = false, notice = null) }
    }

    fun signIn(email: String, password: String) = perform {
        require(validEmail(email) && password.isNotEmpty()) {
            throw UiMessageException(
                uiMessage(R.string.message_enter_your_email_address_and_password)
            )
        }
        signedIn(repository.signIn(email.trim(), password))
    }

    fun signUp(name: String, email: String, password: String) = perform {
        require(name.isNotBlank() && validEmail(email) && validPassword(password)) {
            throw UiMessageException(
                uiMessage(
                    R.string
                        .message_enter_your_name_a_valid_email_and_a_password_of_8_to_128_characters
                )
            )
        }
        signedIn(repository.signUp(name.trim(), email.trim(), password))
    }

    fun sendCode(email: String) = perform {
        require(validEmail(email)) {
            throw UiMessageException(uiMessage(R.string.message_enter_a_valid_email_address))
        }
        repository.sendCode(email.trim())
        mutableState.update { it.copy(completed = true) }
    }

    fun verifyCode(email: String, code: String) = perform {
        require(validCode(code)) {
            throw UiMessageException(
                uiMessage(R.string.message_enter_the_six_digit_code_from_your_email)
            )
        }
        signedIn(repository.verifyCode(email.trim(), code))
    }

    fun requestReset(email: String) = perform {
        require(validEmail(email)) {
            throw UiMessageException(uiMessage(R.string.message_enter_a_valid_email_address))
        }
        repository.requestReset(email.trim())
        mutableState.update { it.copy(completed = true) }
    }

    fun resetPassword(email: String, code: String, password: String) = perform {
        require(validCode(code) && validPassword(password)) {
            throw UiMessageException(
                uiMessage(
                    R.string.message_enter_the_six_digit_code_and_a_password_of_8_to_128_characters
                )
            )
        }
        repository.resetPassword(email.trim(), code, password)
        mutableState.update { it.copy(session = SessionState.SignedOut, completed = true) }
    }

    fun signOut() = perform {
        repository.signOut()
        mutableState.update { it.copy(session = SessionState.SignedOut) }
    }

    private var queuedCallback: String? = null

    fun startGoogle() = perform {
        val flow = java.util.UUID.randomUUID().toString()
        val url = requireNotNull(browser).startGoogle(flow)
        mutableState.update { it.copy(browserUrl = url) }
    }

    fun browserFailed() {
        mutableState.update {
            it.copy(
                browserUrl = null,
                error = uiMessage(R.string.message_could_not_open_the_browser_please_try_again),
            )
        }
    }

    fun browserOpened() {
        mutableState.update { it.copy(browserUrl = null) }
    }

    fun handleDeepLink(value: String) {
        val callback = parseNativeCallback(value) ?: return
        if (callback.path == "/reset-password") {
            val token = callback.parameters["token"]
            if (!token.isNullOrBlank() && token.length <= 4096)
                mutableState.update { it.copy(pendingResetToken = token, error = null) }
            else
                mutableState.update {
                    it.copy(
                        error =
                            uiMessage(R.string.message_this_reset_link_is_invalid_or_has_expired)
                    )
                }
            return
        }
        if (mutableState.value.busy) {
            queuedCallback = value
            return
        }
        perform {
            val flow = callback.parameters["flow"]
            require(flow != null && requireNotNull(browser).consumeFlow(flow)) {
                throw UiMessageException(
                    uiMessage(R.string.message_this_sign_in_attempt_has_expired_please_try_again)
                )
            }
            require(callback.parameters["error"] == null) {
                throw UiMessageException(
                    uiMessage(
                        R.string.message_google_sign_in_could_not_be_completed_please_try_again
                    )
                )
            }
            val cookie =
                callback.parameters["cookie"]
                    ?: throw UiMessageException(
                        uiMessage(R.string.message_no_session_was_returned_please_try_again)
                    )
            signedIn(requireNotNull(browser).finishGoogle(cookie))
        }
    }

    fun requestResetLink(email: String) = perform {
        require(validEmail(email)) {
            throw UiMessageException(uiMessage(R.string.message_enter_a_valid_email_address))
        }
        requireNotNull(browser).requestResetLink(email.trim())
        mutableState.update { it.copy(completed = true) }
    }

    fun resetWithLink(password: String) = perform {
        require(validPassword(password)) {
            throw UiMessageException(uiMessage(R.string.message_use_8_to_128_characters))
        }
        val token = requireNotNull(mutableState.value.resetToken)
        requireNotNull(browser).resetWithToken(token, password)
        mutableState.update {
            it.copy(
                resetToken = null,
                session = SessionState.SignedOut,
                completed = true,
                notice =
                    uiMessage(
                        R.string
                            .message_your_password_has_been_updated_log_in_with_your_new_password
                    ),
            )
        }
    }

    fun acceptResetLink() {
        if (mutableState.value.busy) return
        mutableState.update {
            it.copy(resetToken = it.pendingResetToken, pendingResetToken = null, error = null)
        }
    }

    fun dismissPendingResetLink() {
        mutableState.update { it.copy(pendingResetToken = null) }
    }

    fun dismissResetLink() {
        mutableState.update { it.copy(resetToken = null) }
    }

    private fun signedIn(user: AuthUser) {
        mutableState.update { it.copy(session = SessionState.SignedIn(user)) }
    }

    private fun perform(action: suspend () -> Unit) {
        if (mutableState.value.busy) return
        mutableState.update { it.copy(busy = true, error = null, completed = false) }
        viewModelScope.launch {
            try {
                action()
            } catch (error: Exception) {
                if (error is CancellationException) throw error
                val message =
                    when (error) {
                        is UiMessageException -> error.text
                        is IllegalArgumentException -> error.message?.let(UiMessage::Text)
                        is ResponseException ->
                            when (error.response.status.value) {
                                429 ->
                                    uiMessage(
                                        R.string
                                            .message_too_many_attempts_wait_a_moment_and_try_again
                                    )
                                400,
                                401,
                                403 ->
                                    uiMessage(
                                        R.string
                                            .message_check_your_details_or_request_a_new_code_and_try_again
                                    )
                                422 -> uiMessage(R.string.message_check_your_details_and_try_again)
                                else ->
                                    uiMessage(
                                        R.string
                                            .message_the_server_could_not_complete_your_request_please_try_again
                                    )
                            }
                        else ->
                            uiMessage(
                                R.string
                                    .message_could_not_connect_check_your_connection_and_try_again
                            )
                    }
                mutableState.update { it.copy(error = message) }
            } finally {
                mutableState.update { it.copy(busy = false) }
                val queued = queuedCallback
                queuedCallback = null
                if (queued != null) handleDeepLink(queued)
            }
        }
    }
}

internal fun validEmail(value: String) =
    Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$").matches(value.trim())

internal fun validPassword(value: String) = value.length in 8..128

internal fun validCode(value: String) = Regex("[0-9]{6}").matches(value)
