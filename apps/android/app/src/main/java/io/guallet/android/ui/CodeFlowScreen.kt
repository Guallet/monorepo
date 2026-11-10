package io.guallet.android.ui

import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.text.input.KeyboardType
import io.guallet.android.features.auth.presentation.AuthUiState
import io.guallet.android.features.auth.presentation.AuthViewModel
import kotlinx.coroutines.delay

/** Both email-code login and recovery use the existing Better Auth OTP plugin. */
@Composable
internal fun CodeFlowScreen(
    state: AuthUiState,
    model: AuthViewModel,
    recovery: Boolean,
    onBack: () -> Unit,
) {
    var email by rememberSaveable { mutableStateOf("") }
    var phase by rememberSaveable { mutableIntStateOf(0) }
    var code by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var resendAfter by rememberSaveable { mutableLongStateOf(0L) }
    var remaining by remember { mutableIntStateOf(0) }
    LaunchedEffect(resendAfter) {
        do {
            remaining = ((resendAfter - System.currentTimeMillis()) / 1000).toInt().coerceAtLeast(0)
            if (remaining > 0) delay(1000)
        } while (remaining > 0)
    }
    LaunchedEffect(state.completed) {
        if (state.completed) {
            if (phase == 0) {
                phase = 1
                resendAfter = System.currentTimeMillis() + 30_000
            } else if (recovery && phase == 1) {
                phase = 2
                code = ""
                password = ""
            }
            model.clearFeedback()
        }
    }
    val title =
        when {
            phase == 2 -> "Password updated"
            recovery -> "Reset your password"
            phase == 1 -> "Check your email"
            else -> "Log in with an email code"
        }
    AuthPanel(title) {
        Feedback(state)
        when (phase) {
            0 -> {
                Text(
                    if (recovery) "Enter your account email to request a reset code."
                    else "We’ll send a six-digit code to your email address."
                )
                Input(
                    "Email address",
                    email,
                    !state.busy,
                    KeyboardType.Email,
                    onChange = {
                        email = it
                        model.clearFeedback()
                    },
                )
                Action("Send code", !state.busy && email.isNotBlank()) {
                    if (recovery) model.requestReset(email) else model.sendCode(email)
                }
            }
            1 -> {
                Text(
                    "If an eligible account exists, a code has been sent to ${email.trim()}. Check your inbox and spam folder."
                )
                Input(
                    "Six-digit code",
                    code,
                    !state.busy,
                    KeyboardType.Number,
                    onChange = {
                        code = it.filter(Char::isDigit).take(6)
                        model.clearFeedback()
                    },
                )
                if (recovery) {
                    PasswordInput(
                        password,
                        !state.busy,
                        onChange = {
                            password = it
                            model.clearFeedback()
                        },
                        onDone = { model.resetPassword(email, code, password) },
                    )
                    Text("Use 8 to 128 characters.")
                }
                Action(
                    if (recovery) "Update password" else "Log in",
                    !state.busy && code.length == 6 && (!recovery || password.length in 8..128),
                ) {
                    if (recovery) model.resetPassword(email, code, password)
                    else model.verifyCode(email, code)
                }
                TextButton(
                    enabled = !state.busy && remaining == 0,
                    onClick = {
                        // Reset to the send phase so completion only advances to code entry.
                        phase = 0
                        code = ""
                        if (recovery) model.requestReset(email) else model.sendCode(email)
                    },
                ) {
                    Text(if (remaining > 0) "Resend code in ${remaining}s" else "Resend code")
                }
                TextButton(
                    enabled = !state.busy,
                    onClick = {
                        phase = 0
                        code = ""
                        password = ""
                        model.clearFeedback()
                    },
                ) {
                    Text("Use another email address")
                }
            }
            else -> {
                Text("Your password has been updated. Log in with your new password.")
            }
        }
        TextButton(enabled = !state.busy, onClick = onBack) { Text("Back to log in") }
    }
}
