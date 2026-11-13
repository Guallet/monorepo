package io.guallet.android.features.settings.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.platform.LocalUriHandler
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.guallet.android.BuildConfig
import io.guallet.android.core.money.Currency
import io.guallet.android.features.finance.presentation.FinanceViewModel
import io.guallet.android.features.settings.domain.*
import io.guallet.android.ui.components.*

@Composable
fun SettingsScreen(
    model: FinanceViewModel,
    name: String,
    email: String,
    signingOut: Boolean,
    authError: String?,
    signOut: () -> Unit,
    navigate: (String) -> Unit,
) {
    val profile by model.profile.state.collectAsStateWithLifecycle()
    val settings by model.settings.state.collectAsStateWithLifecycle()
    val mutation by model.mutation.collectAsStateWithLifecycle()
    var signOutDialog by remember { mutableStateOf(false) }
    val uri = LocalUriHandler.current
    LaunchedEffect(Unit) {
        model.clearMutation()
        model.loadSettings()
    }
    LaunchedEffect(mutation.completed) {
        if (mutation.completed) {
            model.loadSettings()
            model.clearMutation()
        }
    }
    FinancePage("Settings") {
        FinanceCard {
            Text(profile.value?.name ?: name, style = MaterialTheme.typography.titleLarge)
            Text(profile.value?.email ?: email)
        }
        profile.error?.let { ErrorNotice(it, model::loadSettings) }
        RemoteContent(settings, model::loadSettings) { preferences ->
            key(preferences) {
                var currency by rememberSaveable {
                    mutableStateOf(preferences.currencies.defaultCurrency ?: "GBP")
                }
                var preferred by rememberSaveable {
                    mutableStateOf(preferences.currencies.preferredCurrencies)
                }
                var dateFormat by rememberSaveable {
                    mutableStateOf(preferences.dateFormat ?: "DD/MM/YYYY")
                }
                val options = Currency.supported.map { it.code to "${it.code} — ${it.name}" }
                fun save(
                    c: String = currency,
                    p: List<String> = preferred,
                    d: String = dateFormat,
                ) {
                    model.mutate {
                        model.repository.updateSettings(UserSettings(CurrencyPreferences(c, p), d))
                    }
                }
                FinanceCard {
                    Text("Preferences", style = MaterialTheme.typography.titleLarge)
                    val enabled = !mutation.busy && !settings.loading
                    ChoiceField("Default currency", currency, options, enabled) {
                        currency = it
                        save(c = it)
                    }
                    Text("Preferred currencies")
                    preferred.forEach { code ->
                        TextButton(
                            enabled = enabled,
                            onClick = {
                                preferred = preferred - code
                                save(p = preferred)
                            },
                        ) {
                            Text("Remove $code")
                        }
                    }
                    ChoiceField(
                        "Add preferred currency",
                        null,
                        options.filterNot { it.first in preferred },
                        enabled,
                    ) {
                        preferred = (preferred + it).distinct()
                        save(p = preferred)
                    }
                    ChoiceField(
                        "Date format",
                        dateFormat,
                        listOf("DD/MM/YYYY", "MM/DD/YYYY", "YYYY/MM/DD").map { it to it },
                        enabled,
                    ) {
                        dateFormat = it
                        save(d = it)
                    }
                    if (mutation.error != null)
                        TextButton(enabled = !mutation.busy, onClick = { save() }) {
                            Text("Retry saving preferences")
                        }
                }
            }
        }
        MutationFeedback(mutation)
        FinanceCard {
            Text("Manage", style = MaterialTheme.typography.titleLarge)
            listOf(
                    "goals" to "Savings goals",
                    "recurring" to "Subscriptions and payments",
                    "categories" to "Categories",
                    "notifications" to "Notifications",
                    "import" to "Import transactions from CSV",
                    "export" to "Export data",
                )
                .forEach { (route, label) ->
                    TextButton(onClick = { navigate(route) }) { Text(label) }
                }
        }
        FinanceCard {
            Text("Tools", style = MaterialTheme.typography.titleLarge)
            listOf(
                    "mortgage" to "Mortgage calculator",
                    "loan" to "Loan calculator",
                    "stamp-duty" to "Stamp duty calculator",
                )
                .forEach { (route, label) ->
                    TextButton(onClick = { navigate(route) }) { Text(label) }
                }
        }
        authError?.let { ErrorNotice(it) }
        Button(enabled = !signingOut, onClick = { signOutDialog = true }) {
            Text(if (signingOut) "Signing out…" else "Sign out")
        }
        Text("Guallet ${BuildConfig.VERSION_NAME}")
        TextButton(onClick = { uri.openUri("https://guallet.io") }) { Text("Guallet website") }
        TextButton(onClick = { uri.openUri("https://github.com/Guallet/monorepo") }) {
            Text("Source code")
        }
    }
    if (signOutDialog)
        AlertDialog(
            onDismissRequest = { if (!signingOut) signOutDialog = false },
            title = { Text("Sign out?") },
            confirmButton = {
                TextButton(
                    enabled = !signingOut,
                    onClick = {
                        signOutDialog = false
                        signOut()
                    },
                ) {
                    Text("Sign out")
                }
            },
            dismissButton = {
                TextButton(enabled = !signingOut, onClick = { signOutDialog = false }) {
                    Text("Cancel")
                }
            },
        )
}
