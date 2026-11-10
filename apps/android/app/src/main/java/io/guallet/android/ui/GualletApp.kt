package io.guallet.android.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.*
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.*
import io.guallet.android.features.auth.presentation.AuthUiState
import io.guallet.android.features.auth.presentation.AuthViewModel
import io.guallet.android.features.auth.presentation.SessionState
import io.guallet.android.ui.theme.GualletTokens as Tokens
import org.koin.androidx.compose.koinViewModel

@Composable
fun GualletApp(model: AuthViewModel = koinViewModel()) {
    val state by model.state.collectAsStateWithLifecycle()
    // Prevent a form being abandoned while its request is changing session state.
    BackHandler(state.busy) {}
    Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        when (val session = state.session) {
            SessionState.Loading ->
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            SessionState.Unavailable ->
                AuthPanel("Could not load your session") {
                    Text("Check your connection and try again.")
                    Action("Try again", !state.busy, model::restoreSession)
                }
            SessionState.SignedOut -> key("signed-out") { AuthNavigation(state, model) }
            is SessionState.SignedIn ->
                AuthPanel("Welcome, ${session.user.name}") {
                    Text(session.user.email)
                    Text(
                        "You are signed in. Your finances will be available here in a future update."
                    )
                    Feedback(state)
                    Action("Sign out", !state.busy, model::signOut)
                }
        }
    }
}

@Composable
private fun AuthNavigation(state: AuthUiState, model: AuthViewModel) {
    val nav = rememberNavController()
    fun navigate(route: String) {
        if (state.busy) return
        model.clearFeedback()
        nav.navigate(route) { launchSingleTop = true }
    }
    NavHost(navController = nav, startDestination = "welcome") {
        composable("welcome") {
            AuthPanel("Your finances, under control.") {
                Text(
                    "Guallet",
                    style = MaterialTheme.typography.headlineLarge,
                    color = MaterialTheme.colorScheme.primary,
                )
                Text("Your financial data stays yours.")
                Action("Log in", !state.busy) { navigate("login") }
                TextButton(onClick = { navigate("signup") }) { Text("Create account") }
            }
        }
        composable("login") {
            CredentialsScreen(
                state,
                model,
                false,
                onBack = { navigate("welcome") },
                onAlternative = { navigate("signup") },
                onCode = { navigate("code") },
                onRecovery = { navigate("recovery") },
            )
        }
        composable("signup") {
            CredentialsScreen(
                state,
                model,
                true,
                onBack = { navigate("welcome") },
                onAlternative = { navigate("login") },
                onCode = { navigate("code") },
                onRecovery = { navigate("recovery") },
            )
        }
        composable("code") { CodeFlowScreen(state, model, false, onBack = { navigate("login") }) }
        composable("recovery") {
            CodeFlowScreen(state, model, true, onBack = { navigate("login") })
        }
    }
}

@Composable
private fun CredentialsScreen(
    state: AuthUiState,
    model: AuthViewModel,
    registration: Boolean,
    onBack: () -> Unit,
    onAlternative: () -> Unit,
    onCode: () -> Unit,
    onRecovery: () -> Unit,
) {
    var email by rememberSaveable { mutableStateOf("") }
    var name by rememberSaveable { mutableStateOf("") }
    // Sensitive fields survive recomposition, never saved state or disk.
    var password by remember { mutableStateOf("") }
    val submit = {
        if (registration) model.signUp(name, email, password) else model.signIn(email, password)
    }
    AuthPanel(if (registration) "Create your free account" else "Log in to Guallet") {
        Feedback(state)
        if (registration)
            Input(
                "Name",
                name,
                !state.busy,
                onChange = {
                    name = it
                    model.clearFeedback()
                },
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
        PasswordInput(
            password,
            !state.busy,
            onChange = {
                password = it
                model.clearFeedback()
            },
            onDone = submit,
        )
        if (registration)
            Text("Use 8 to 128 characters.", style = MaterialTheme.typography.bodyMedium)
        Action(
            if (registration) "Create account" else "Log in",
            !state.busy && email.isNotBlank() && password.isNotEmpty(),
            submit,
        )
        if (!registration) {
            TextButton(enabled = !state.busy, onClick = onRecovery) { Text("Forgot password?") }
            TextButton(enabled = !state.busy, onClick = onCode) {
                Text("Log in with an email code")
            }
        }
        TextButton(enabled = !state.busy, onClick = onAlternative) {
            Text(if (registration) "Already have an account? Log in" else "Create account")
        }
        TextButton(enabled = !state.busy, onClick = onBack) { Text("Back") }
    }
}

@Composable
internal fun AuthPanel(title: String, content: @Composable ColumnScope.() -> Unit) {
    Box(
        Modifier.fillMaxSize().safeDrawingPadding().imePadding(),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            Modifier.widthIn(max = Tokens.contentWidth)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(Tokens.gutter)
        ) {
            Card(
                shape = RoundedCornerShape(Tokens.cardRadius),
                border = BorderStroke(Tokens.borderWidth, Tokens.border),
                colors =
                    CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = Tokens.cardElevation),
            ) {
                Column(
                    Modifier.fillMaxWidth().padding(Tokens.large),
                    verticalArrangement = Arrangement.spacedBy(Tokens.gutter),
                ) {
                    Text(title, style = MaterialTheme.typography.headlineMedium)
                    content()
                }
            }
        }
    }
}

@Composable
internal fun Feedback(state: AuthUiState) {
    if (state.busy) LinearProgressIndicator(Modifier.fillMaxWidth())
    state.error?.let {
        Text(
            it,
            color = MaterialTheme.colorScheme.error,
            modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
        )
    }
}

@Composable
internal fun Action(label: String, enabled: Boolean = true, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(Tokens.small),
    ) {
        Text(label)
    }
}

@Composable
internal fun Input(
    label: String,
    value: String,
    enabled: Boolean,
    keyboard: KeyboardType = KeyboardType.Text,
    onChange: (String) -> Unit,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        enabled = enabled,
        label = { Text(label) },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = keyboard, imeAction = ImeAction.Next),
        modifier = Modifier.fillMaxWidth(),
    )
}

@Composable
internal fun PasswordInput(
    value: String,
    enabled: Boolean,
    onChange: (String) -> Unit,
    onDone: () -> Unit,
) {
    var visible by remember { mutableStateOf(false) }
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        enabled = enabled,
        label = { Text("Password") },
        singleLine = true,
        visualTransformation =
            if (visible) VisualTransformation.None else PasswordVisualTransformation(),
        keyboardOptions =
            KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
        keyboardActions = KeyboardActions(onDone = { if (enabled) onDone() }),
        trailingIcon = {
            TextButton(onClick = { visible = !visible }) { Text(if (visible) "Hide" else "Show") }
        },
        modifier = Modifier.fillMaxWidth(),
    )
}
