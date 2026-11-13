package io.guallet.android.ui

import androidx.activity.compose.BackHandler
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.*
import androidx.compose.ui.text.input.KeyboardType
import io.guallet.android.features.auth.presentation.AuthUiState
import io.guallet.android.features.auth.presentation.AuthViewModel

@Composable
fun ResetLinkScreen(state: AuthUiState, model: AuthViewModel) {
    BackHandler { if (!state.busy) model.dismissResetLink() }
    var password by remember { mutableStateOf("") }
    AuthPanel("Choose a new password") {
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
        Action("Update password", !state.busy && password.length in 8..128) {
            model.resetWithLink(password)
        }
        TextButton(enabled = !state.busy, onClick = model::dismissResetLink) { Text("Cancel") }
    }
}

@Composable
fun ResetLinkRequestScreen(state: AuthUiState, model: AuthViewModel, onBack: () -> Unit) {
    var email by remember { mutableStateOf("") }
    AuthPanel("Request a reset link") {
        Feedback(state)
        if (state.completed)
            Text(
                "If an eligible account exists, a reset link has been sent. Open it on this device to choose a new password."
            )
        else {
            Input("Email address", email, !state.busy, KeyboardType.Email) {
                email = it
                model.clearFeedback()
            }
            Action("Send reset link", !state.busy && email.isNotBlank()) {
                model.requestResetLink(email)
            }
        }
        TextButton(enabled = !state.busy, onClick = onBack) { Text("Back to log in") }
    }
}
