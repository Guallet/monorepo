package io.guallet.android.features.settings.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.platform.LocalUriHandler
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.guallet.android.BuildConfig
import io.guallet.android.R
import io.guallet.android.core.money.Currency
import io.guallet.android.core.state.*
import io.guallet.android.features.finance.presentation.FinanceViewModel
import io.guallet.android.features.settings.domain.*
import io.guallet.android.ui.components.*

@Composable
fun SettingsScreen(
    model: FinanceViewModel,
    name: String,
    email: String,
    signingOut: Boolean,
    authError: UiMessage?,
    signOut: () -> Unit,
    navigate: (String) -> Unit,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val profile by model.profile.state.collectAsStateWithLifecycle()
    val settings by model.settings.state.collectAsStateWithLifecycle()
    val mutation by model.mutation.collectAsStateWithLifecycle()
    var signOutDialog by remember { mutableStateOf(false) }
    val uri = LocalUriHandler.current
    var linkError by remember { mutableStateOf(false) }
    fun openLink(url: String) {
        linkError = !openExternalUri(uri, url)
    }
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
    FinancePage(resources.getString(R.string.settings)) {
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
                    Text(
                        resources.getString(R.string.preferences),
                        style = MaterialTheme.typography.titleLarge,
                    )
                    val enabled = !mutation.busy && !settings.loading
                    ChoiceField(
                        resources.getString(R.string.default_currency),
                        currency,
                        options,
                        enabled,
                    ) {
                        currency = it
                        save(c = it)
                    }
                    Text(resources.getString(R.string.preferred_currencies))
                    preferred.forEach { code ->
                        TextButton(
                            enabled = enabled,
                            onClick = {
                                preferred = preferred - code
                                save(p = preferred)
                            },
                        ) {
                            Text(resources.getString(R.string.remove_value, code))
                        }
                    }
                    ChoiceField(
                        resources.getString(R.string.add_preferred_currency),
                        null,
                        options.filterNot { it.first in preferred },
                        enabled,
                    ) {
                        preferred = (preferred + it).distinct()
                        save(p = preferred)
                    }
                    ChoiceField(
                        resources.getString(R.string.date_format),
                        dateFormat,
                        listOf("DD/MM/YYYY", "MM/DD/YYYY", "YYYY/MM/DD").map { it to it },
                        enabled,
                    ) {
                        dateFormat = it
                        save(d = it)
                    }
                    if (mutation.error != null)
                        TextButton(enabled = !mutation.busy, onClick = { save() }) {
                            Text(resources.getString(R.string.retry_saving_preferences))
                        }
                }
            }
        }
        MutationFeedback(mutation)
        FinanceCard {
            Text(resources.getString(R.string.manage), style = MaterialTheme.typography.titleLarge)
            listOf(
                    "goals" to resources.getString(R.string.savings_goals),
                    "recurring" to resources.getString(R.string.subscriptions_and_payments),
                    "categories" to resources.getString(R.string.categories),
                    "notifications" to resources.getString(R.string.notifications),
                    "import" to resources.getString(R.string.import_transactions_from_csv),
                    "export" to resources.getString(R.string.export_data),
                )
                .forEach { (route, label) ->
                    TextButton(onClick = { navigate(route) }) { Text(label) }
                }
        }
        FinanceCard {
            Text(resources.getString(R.string.tools), style = MaterialTheme.typography.titleLarge)
            listOf(
                    "mortgage" to resources.getString(R.string.mortgage_calculator),
                    "loan" to resources.getString(R.string.loan_calculator),
                    "stamp-duty" to resources.getString(R.string.stamp_duty_calculator),
                )
                .forEach { (route, label) ->
                    TextButton(onClick = { navigate(route) }) { Text(label) }
                }
        }
        authError?.let { ErrorNotice(it) }
        Button(enabled = !signingOut, onClick = { signOutDialog = true }) {
            Text(
                if (signingOut) resources.getString(R.string.signing_out)
                else resources.getString(R.string.sign_out)
            )
        }
        if (linkError)
            ErrorNotice(resources.getString(R.string.could_not_open_a_browser_please_try_again))
        Text(resources.getString(R.string.guallet_value, BuildConfig.VERSION_NAME))
        TextButton(onClick = { openLink("https://guallet.io") }) {
            Text(resources.getString(R.string.guallet_website))
        }
        TextButton(onClick = { openLink("https://github.com/Guallet/monorepo") }) {
            Text(resources.getString(R.string.source_code))
        }
    }
    if (signOutDialog)
        AlertDialog(
            onDismissRequest = { if (!signingOut) signOutDialog = false },
            title = { Text(resources.getString(R.string.sign_out_c1c084)) },
            confirmButton = {
                TextButton(
                    enabled = !signingOut,
                    onClick = {
                        signOutDialog = false
                        signOut()
                    },
                ) {
                    Text(resources.getString(R.string.sign_out))
                }
            },
            dismissButton = {
                TextButton(enabled = !signingOut, onClick = { signOutDialog = false }) {
                    Text(resources.getString(R.string.cancel))
                }
            },
        )
}
