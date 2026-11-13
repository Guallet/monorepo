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
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.*
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.compose.ui.window.SecureFlagPolicy
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.*
import io.guallet.android.R
import io.guallet.android.core.state.*
import io.guallet.android.features.auth.presentation.AuthUiState
import io.guallet.android.features.auth.presentation.AuthViewModel
import io.guallet.android.features.auth.presentation.SessionState
import io.guallet.android.ui.components.openExternalUri
import io.guallet.android.ui.theme.GualletTokens as Tokens
import org.koin.androidx.compose.koinViewModel

@Composable
fun GualletApp(model: AuthViewModel = koinViewModel()) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val state by model.state.collectAsStateWithLifecycle()
    val uri = LocalUriHandler.current
    LaunchedEffect(state.browserUrl) {
        state.browserUrl?.let { url ->
            if (openExternalUri(uri, url)) model.browserOpened() else model.browserFailed()
        }
    }
    var financeBusy by remember { mutableStateOf(false) }
    // Prevent a form being abandoned while its request is changing session state.
    BackHandler(state.busy) {}
    Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        when (val session = state.session) {
            SessionState.Loading ->
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            SessionState.Unavailable ->
                AuthPanel(resources.getString(R.string.could_not_load_your_session)) {
                    Text(resources.getString(R.string.check_your_connection_and_try_again))
                    Action(
                        resources.getString(R.string.try_again),
                        !state.busy,
                        model::restoreSession,
                    )
                }
            SessionState.SignedOut -> key("signed-out") { AuthNavigation(state, model) }
            is SessionState.SignedIn -> NativeApp(session.user, model) { financeBusy = it }
        }
    }
    if (state.pendingResetToken != null)
        AlertDialog(
            onDismissRequest = model::dismissPendingResetLink,
            title = { Text(resources.getString(R.string.open_password_reset)) },
            text = {
                Text(
                    if (financeBusy)
                        resources.getString(
                            R.string
                                .wait_for_your_current_operation_to_finish_your_work_will_stay_here
                        )
                    else
                        resources.getString(
                            R.string
                                .your_current_work_will_stay_open_while_you_check_this_reset_link
                        )
                )
            },
            confirmButton = {
                TextButton(
                    enabled = !state.busy && !financeBusy,
                    onClick = model::acceptResetLink,
                ) {
                    Text(resources.getString(R.string.action_continue))
                }
            },
            dismissButton = {
                TextButton(onClick = model::dismissPendingResetLink) {
                    Text(resources.getString(R.string.cancel))
                }
            },
        )
    if (state.resetToken != null)
        Dialog(
            onDismissRequest = { if (!state.busy) model.dismissResetLink() },
            properties =
                DialogProperties(
                    usePlatformDefaultWidth = false,
                    securePolicy = SecureFlagPolicy.SecureOn,
                ),
        ) {
            Surface { ResetLinkScreen(state, model) }
        }
}

@Composable
private fun AuthNavigation(state: AuthUiState, model: AuthViewModel) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val nav = rememberNavController()
    fun navigate(route: String) {
        if (state.busy) return
        model.clearFeedback()
        nav.navigate(route) { launchSingleTop = true }
    }
    fun backTo(route: String) {
        if (state.busy) return
        model.clearFeedback()
        if (!nav.popBackStack(route, false))
            nav.navigate(route) {
                popUpTo(nav.graph.startDestinationId)
                launchSingleTop = true
            }
    }
    NavHost(navController = nav, startDestination = "welcome") {
        composable("welcome") {
            AuthPanel(resources.getString(R.string.your_finances_under_control)) {
                Text(
                    resources.getString(R.string.guallet),
                    style = MaterialTheme.typography.headlineLarge,
                    color = MaterialTheme.colorScheme.primary,
                )
                Text(resources.getString(R.string.your_financial_data_stays_yours))
                Feedback(state)
                Action(
                    resources.getString(R.string.continue_with_google),
                    !state.busy,
                    model::startGoogle,
                )
                Action(resources.getString(R.string.log_in), !state.busy) { navigate("login") }
                TextButton(onClick = { navigate("signup") }) {
                    Text(resources.getString(R.string.create_account))
                }
            }
        }
        composable("login") {
            CredentialsScreen(
                state,
                model,
                false,
                onBack = { backTo("welcome") },
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
                onBack = { backTo("welcome") },
                onAlternative = { navigate("login") },
                onCode = { navigate("code") },
                onRecovery = { navigate("recovery") },
            )
        }
        composable("code") { CodeFlowScreen(state, model, false, onBack = { backTo("login") }) }
        composable("reset-link") {
            ResetLinkRequestScreen(state, model, onBack = { backTo("login") })
        }
        composable("recovery") {
            CodeFlowScreen(
                state,
                model,
                true,
                onBack = { backTo("login") },
                onResetLink = { navigate("reset-link") },
            )
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
    val resources = androidx.compose.ui.platform.LocalResources.current

    var email by rememberSaveable { mutableStateOf("") }
    var name by rememberSaveable { mutableStateOf("") }
    // Sensitive fields survive recomposition, never saved state or disk.
    var password by remember { mutableStateOf("") }
    val submit = {
        if (registration) model.signUp(name, email, password) else model.signIn(email, password)
    }
    AuthPanel(
        if (registration) resources.getString(R.string.create_your_free_account)
        else resources.getString(R.string.log_in_to_guallet)
    ) {
        Feedback(state)
        if (registration)
            Input(
                resources.getString(R.string.name),
                name,
                !state.busy,
                onChange = {
                    name = it
                    model.clearFeedback()
                },
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
            Text(
                resources.getString(R.string.use_8_to_128_characters),
                style = MaterialTheme.typography.bodyMedium,
            )
        Action(
            if (registration) resources.getString(R.string.create_account)
            else resources.getString(R.string.log_in),
            !state.busy && email.isNotBlank() && password.isNotEmpty(),
            submit,
        )
        if (!registration) {
            TextButton(enabled = !state.busy, onClick = onRecovery) {
                Text(resources.getString(R.string.forgot_password))
            }
            TextButton(enabled = !state.busy, onClick = onCode) {
                Text(resources.getString(R.string.log_in_with_an_email_code))
            }
        }
        TextButton(enabled = !state.busy, onClick = onAlternative) {
            Text(
                if (registration) resources.getString(R.string.already_have_an_account_log_in)
                else resources.getString(R.string.create_account)
            )
        }
        TextButton(enabled = !state.busy, onClick = onBack) {
            Text(resources.getString(R.string.back))
        }
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
    val resources = androidx.compose.ui.platform.LocalResources.current
    state.notice?.let { Text(it.resolve(resources)) }
    if (state.busy) LinearProgressIndicator(Modifier.fillMaxWidth())
    state.error?.let {
        Text(
            it.resolve(resources),
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
    val resources = androidx.compose.ui.platform.LocalResources.current

    var visible by remember { mutableStateOf(false) }
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        enabled = enabled,
        label = { Text(resources.getString(R.string.password)) },
        singleLine = true,
        visualTransformation =
            if (visible) VisualTransformation.None else PasswordVisualTransformation(),
        keyboardOptions =
            KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
        keyboardActions = KeyboardActions(onDone = { if (enabled) onDone() }),
        trailingIcon = {
            TextButton(onClick = { visible = !visible }) {
                Text(
                    if (visible) resources.getString(R.string.hide)
                    else resources.getString(R.string.show)
                )
            }
        },
        modifier = Modifier.fillMaxWidth(),
    )
}
