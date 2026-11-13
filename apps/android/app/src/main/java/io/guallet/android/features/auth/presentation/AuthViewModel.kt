package io.guallet.android.features.auth.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
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
    val error: String? = null,
    val completed: Boolean = false,
    val browserUrl: String? = null,
    val resetToken: String? = null,
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
        mutableState.update { it.copy(error = null, completed = false) }
    }

    fun signIn(email: String, password: String) = perform {
        require(validEmail(email) && password.isNotEmpty()) {
            "Enter your email address and password."
        }
        signedIn(repository.signIn(email.trim(), password))
    }

    fun signUp(name: String, email: String, password: String) = perform {
        require(name.isNotBlank() && validEmail(email) && validPassword(password)) {
            "Enter your name, a valid email, and a password of 8 to 128 characters."
        }
        signedIn(repository.signUp(name.trim(), email.trim(), password))
    }

    fun sendCode(email: String) = perform {
        require(validEmail(email)) { "Enter a valid email address." }
        repository.sendCode(email.trim())
        mutableState.update { it.copy(completed = true) }
    }

    fun verifyCode(email: String, code: String) = perform {
        require(validCode(code)) { "Enter the six-digit code from your email." }
        signedIn(repository.verifyCode(email.trim(), code))
    }

    fun requestReset(email: String) = perform {
        require(validEmail(email)) { "Enter a valid email address." }
        repository.requestReset(email.trim())
        mutableState.update { it.copy(completed = true) }
    }

    fun resetPassword(email: String, code: String, password: String) = perform {
        require(validCode(code) && validPassword(password)) {
            "Enter the six-digit code and a password of 8 to 128 characters."
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
            it.copy(browserUrl = null, error = "Could not open the browser. Please try again.")
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
                mutableState.update { it.copy(resetToken = token, error = null) }
            else
                mutableState.update {
                    it.copy(error = "This reset link is invalid or has expired.")
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
                "This sign-in attempt has expired. Please try again."
            }
            require(callback.parameters["error"] == null) {
                "Google sign-in could not be completed. Please try again."
            }
            val cookie =
                callback.parameters["cookie"]
                    ?: throw IllegalArgumentException("No session was returned. Please try again.")
            signedIn(requireNotNull(browser).finishGoogle(cookie))
        }
    }

    fun requestResetLink(email: String) = perform {
        require(validEmail(email)) { "Enter a valid email address." }
        requireNotNull(browser).requestResetLink(email.trim())
        mutableState.update { it.copy(completed = true) }
    }

    fun resetWithLink(password: String) = perform {
        require(validPassword(password)) { "Use 8 to 128 characters." }
        val token = requireNotNull(mutableState.value.resetToken)
        requireNotNull(browser).resetWithToken(token, password)
        mutableState.update {
            it.copy(resetToken = null, session = SessionState.SignedOut, completed = true)
        }
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
                        is IllegalArgumentException -> error.message
                        is ResponseException ->
                            when (error.response.status.value) {
                                429 -> "Too many attempts. Wait a moment and try again."
                                400,
                                401,
                                403 -> "Check your details or request a new code and try again."
                                422 -> "Check your details and try again."
                                else ->
                                    "The server could not complete your request. Please try again."
                            }
                        else -> "Could not connect. Check your connection and try again."
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
