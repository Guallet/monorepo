package io.guallet.android.ui

import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.text.input.KeyboardType
import io.guallet.android.R
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
    onResetLink: (() -> Unit)? = null,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current

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
            phase == 2 -> resources.getString(R.string.password_updated)
            recovery -> resources.getString(R.string.reset_your_password)
            phase == 1 -> resources.getString(R.string.check_your_email)
            else -> resources.getString(R.string.log_in_with_an_email_code)
        }
    AuthPanel(title) {
        Feedback(state)
        when (phase) {
            0 -> {
                Text(
                    if (recovery)
                        resources.getString(
                            R.string.enter_your_account_email_to_request_a_reset_code
                        )
                    else
                        resources.getString(
                            R.string.we_ll_send_a_six_digit_code_to_your_email_address
                        )
                )
                Input(
                    resources.getString(R.string.email_address),
                    email,
                    !state.busy,
                    KeyboardType.Email,
                    onChange = {
                        email = it
                        model.clearFeedback()
                    },
                )
                Action(resources.getString(R.string.send_code), !state.busy && email.isNotBlank()) {
                    if (recovery) model.requestReset(email) else model.sendCode(email)
                }
            }
            1 -> {
                Text(
                    resources.getString(
                        R.string
                            .if_an_eligible_account_exists_a_code_has_been_sent_to_value_check_your_inbox_and_spam_fo,
                        email.trim(),
                    )
                )
                Input(
                    resources.getString(R.string.six_digit_code),
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
                    Text(resources.getString(R.string.use_8_to_128_characters))
                }
                Action(
                    if (recovery) resources.getString(R.string.update_password)
                    else resources.getString(R.string.log_in),
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
                    Text(
                        if (remaining > 0)
                            resources.getQuantityString(
                                R.plurals.resend_seconds,
                                remaining,
                                remaining,
                            )
                        else resources.getString(R.string.resend_code)
                    )
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
                    Text(resources.getString(R.string.use_another_email_address))
                }
            }
            else -> {
                Text(
                    resources.getString(
                        R.string.your_password_has_been_updated_log_in_with_your_new_password
                    )
                )
            }
        }
        if (recovery && onResetLink != null)
            TextButton(enabled = !state.busy, onClick = onResetLink) {
                Text(resources.getString(R.string.send_a_password_reset_link_instead))
            }
        TextButton(enabled = !state.busy, onClick = onBack) {
            Text(resources.getString(R.string.back_to_log_in))
        }
    }
}
