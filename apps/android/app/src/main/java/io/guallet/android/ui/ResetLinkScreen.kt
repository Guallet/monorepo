package io.guallet.android.ui

import androidx.activity.compose.BackHandler
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.*
import androidx.compose.ui.text.input.KeyboardType
import io.guallet.android.R
import io.guallet.android.features.auth.presentation.AuthUiState
import io.guallet.android.features.auth.presentation.AuthViewModel

@Composable
fun ResetLinkScreen(state: AuthUiState, model: AuthViewModel) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    BackHandler { if (!state.busy) model.dismissResetLink() }
    var password by remember { mutableStateOf("") }
    AuthPanel(resources.getString(R.string.choose_a_new_password)) {
        Feedback(state)
        PasswordInput(
            password,
            !state.busy,
            {
                password = it
                model.clearFeedback()
            },
        ) {
            model.resetWithLink(password)
        }
        Action(
            resources.getString(R.string.update_password),
            !state.busy && password.length in 8..128,
        ) {
            model.resetWithLink(password)
        }
        TextButton(enabled = !state.busy, onClick = model::dismissResetLink) {
            Text(resources.getString(R.string.cancel))
        }
    }
}

@Composable
fun ResetLinkRequestScreen(state: AuthUiState, model: AuthViewModel, onBack: () -> Unit) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    var email by remember { mutableStateOf("") }
    AuthPanel(resources.getString(R.string.request_a_reset_link)) {
        Feedback(state)
        if (state.completed)
            Text(
                resources.getString(
                    R.string
                        .if_an_eligible_account_exists_a_reset_link_has_been_sent_open_it_on_this_device_to_choos
                )
            )
        else {
            Input(
                resources.getString(R.string.email_address),
                email,
                !state.busy,
                KeyboardType.Email,
            ) {
                email = it
                model.clearFeedback()
            }
            Action(
                resources.getString(R.string.send_reset_link),
                !state.busy && email.isNotBlank(),
            ) {
                model.requestResetLink(email)
            }
        }
        TextButton(enabled = !state.busy, onClick = onBack) {
            Text(resources.getString(R.string.back_to_log_in))
        }
    }
}
