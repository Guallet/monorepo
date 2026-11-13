package io.guallet.android.ui

import android.net.Uri
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.LocalViewModelStoreOwner
import androidx.navigation.compose.*
import io.guallet.android.R
import io.guallet.android.features.accounts.presentation.*
import io.guallet.android.features.auth.domain.AuthUser
import io.guallet.android.features.auth.presentation.AuthViewModel
import io.guallet.android.features.budgets.domain.*
import io.guallet.android.features.calculators.*
import io.guallet.android.features.categories.presentation.CategoriesScreen
import io.guallet.android.features.dashboard.DashboardScreen
import io.guallet.android.features.finance.presentation.FinanceViewModel
import io.guallet.android.features.notifications.presentation.NotificationsScreen
import io.guallet.android.features.planning.*
import io.guallet.android.features.settings.presentation.SettingsScreen
import io.guallet.android.features.transactions.presentation.*
import io.guallet.android.features.transfer.*
import io.guallet.android.ui.components.LocalDateFormat
import org.koin.androidx.compose.koinViewModel
import org.koin.compose.koinInject

/** Finance ViewModels and in-memory documents are destroyed on sign-out/user changes. */
@Composable
fun NativeApp(user: AuthUser, auth: AuthViewModel) {
    key(user.id) {
        val session: NativeSessionScope = koinViewModel(key = "native-session-${user.id}")
        val store = session.store
        val activity = LocalContext.current.activity()
        val owner =
            remember(store) {
                object : ViewModelStoreOwner {
                    override val viewModelStore = store
                }
            }
        DisposableEffect(store) {
            onDispose { if (activity?.isChangingConfigurations != true) store.clear() }
        }
        CompositionLocalProvider(LocalViewModelStoreOwner provides owner) {
            NativeNavigation(user, auth)
        }
    }
}

@Composable
private fun NativeNavigation(user: AuthUser, auth: AuthViewModel) {
    val model: FinanceViewModel = koinViewModel()
    val accounts: AccountsViewModel = koinViewModel()
    val importer: ImportViewModel = koinViewModel()
    val transfer: TransferRepository = koinInject()
    val authState by auth.state.collectAsStateWithLifecycle()
    val expired by model.unauthorized.collectAsStateWithLifecycle()
    val transferExpired by importer.unauthorized.collectAsStateWithLifecycle()
    val accountState by accounts.state.collectAsStateWithLifecycle()
    val settings by model.settings.state.collectAsStateWithLifecycle()
    val mutation by model.mutation.collectAsStateWithLifecycle()
    LaunchedEffect(expired, accountState.unauthorized, transferExpired) {
        if (expired || accountState.unauthorized || transferExpired) auth.restoreSession()
    }
    val currency = settings.value?.currencies?.defaultCurrency ?: "GBP"
    LaunchedEffect(user.id) { model.loadSettings() }
    val nav = rememberNavController()
    val entry by nav.currentBackStackEntryAsState()
    val route = entry?.destination?.route
    val tabs =
        listOf(
            Triple("home", "Home", R.drawable.nav_home),
            Triple("accounts", "Accounts", R.drawable.nav_wallet),
            Triple("transactions", "Transactions", R.drawable.nav_receipt),
            Triple("budgets", "Budgets", R.drawable.nav_chartpie),
            Triple("settings", "Settings", R.drawable.nav_settings),
        )
    fun navigate(value: String) {
        if (!mutation.busy && !accountState.saving) nav.navigate(value) { launchSingleTop = true }
    }
    val back = {
        if (!mutation.busy && !accountState.saving) nav.popBackStack()
        Unit
    }
    BackHandler(mutation.busy || accountState.saving) {}
    Scaffold(
        bottomBar = {
            if (tabs.any { it.first == route })
                NavigationBar {
                    tabs.forEach { (destination, label, icon) ->
                        NavigationBarItem(
                            selected = route == destination,
                            enabled = !mutation.busy && !accountState.saving,
                            onClick = {
                                nav.navigate(destination) {
                                    popUpTo("home") { saveState = true }
                                    restoreState = true
                                    launchSingleTop = true
                                }
                            },
                            icon = { Icon(painterResource(icon), contentDescription = null) },
                            label = { Text(label) },
                        )
                    }
                }
        }
    ) { padding ->
        CompositionLocalProvider(
            LocalDateFormat provides (settings.value?.dateFormat ?: "DD/MM/YYYY")
        ) {
            Box(Modifier.padding(padding)) {
                NavHost(nav, startDestination = "home") {
                    composable("home") { DashboardScreen(model, user.name, ::navigate) }
                    composable("accounts") {
                        AccountsScreen(
                            accounts,
                            { navigate("accounts/${Uri.encode(it)}") },
                            { navigate("accounts/new") },
                        )
                    }
                    composable("accounts/new") {
                        AccountFormScreen(null, accounts, currency, back) { id ->
                            nav.popBackStack()
                            navigate("accounts/${Uri.encode(id)}")
                        }
                    }
                    composable("accounts/{id}") { current ->
                        val id = current.arguments?.getString("id") ?: return@composable
                        AccountDetailsScreen(
                            id,
                            accounts,
                            back,
                            { navigate("accounts/${Uri.encode(id)}/edit") },
                            { navigate("transactions/${Uri.encode(it)}") },
                            { navigate("accounts/${Uri.encode(id)}/history") },
                        )
                    }
                    composable("accounts/{id}/edit") { current ->
                        val id = current.arguments?.getString("id") ?: return@composable
                        AccountFormScreen(id, accounts, currency, back) { nav.popBackStack() }
                    }
                    composable("accounts/{id}/history") { current ->
                        AccountChartScreen(
                            current.arguments!!.getString("id")!!,
                            accounts,
                            model,
                            back,
                        )
                    }
                    composable("transactions") {
                        TransactionsScreen(
                            model,
                            { navigate("transactions/${Uri.encode(it)}") },
                            { navigate("transactions/new") },
                        )
                    }
                    composable("transactions/new") {
                        TransactionScreen(null, model, currency, back)
                    }
                    composable("transactions/{id}") { current ->
                        TransactionScreen(
                            current.arguments!!.getString("id")!!,
                            model,
                            currency,
                            back,
                        )
                    }
                    composable("budgets") {
                        BudgetsScreen(
                            model,
                            { navigate("budgets/${Uri.encode(it)}") },
                            { navigate("budgets/new") },
                        )
                    }
                    composable("budgets/new") { BudgetFormScreen(null, model, currency, back) }
                    composable("budgets/{id}") { current ->
                        val id = current.arguments!!.getString("id")!!
                        BudgetDetails(
                            id,
                            model,
                            back,
                            { navigate("budgets/${Uri.encode(id)}/edit") },
                            { navigate("transactions/${Uri.encode(it)}") },
                        )
                    }
                    composable("budgets/{id}/edit") { current ->
                        BudgetFormScreen(
                            current.arguments!!.getString("id")!!,
                            model,
                            currency,
                            back,
                        )
                    }
                    composable("goals") {
                        GoalsScreen(
                            model,
                            back,
                            { navigate("goals/${Uri.encode(it)}") },
                            { navigate("goals/new") },
                        )
                    }
                    composable("goals/new") { GoalFormScreen(null, model, back) }
                    composable("goals/{id}") { current ->
                        val id = current.arguments!!.getString("id")!!
                        GoalDetails(id, model, back) { navigate("goals/${Uri.encode(id)}/edit") }
                    }
                    composable("goals/{id}/edit") { current ->
                        GoalFormScreen(current.arguments!!.getString("id")!!, model, back)
                    }
                    composable("recurring") {
                        RecurringScreen(
                            model,
                            back,
                            { navigate("recurring/${Uri.encode(it)}") },
                            { navigate("recurring/new") },
                        )
                    }
                    composable("recurring/new") { RecurringFormScreen(null, model, currency, back) }
                    composable("recurring/{id}") { current ->
                        val id = current.arguments!!.getString("id")!!
                        RecurringDetails(id, model, back) {
                            navigate("recurring/${Uri.encode(id)}/edit")
                        }
                    }
                    composable("recurring/{id}/edit") { current ->
                        RecurringFormScreen(
                            current.arguments!!.getString("id")!!,
                            model,
                            currency,
                            back,
                        )
                    }
                    composable("categories") { CategoriesScreen(model, back) }
                    composable("notifications") { NotificationsScreen(model, back, ::navigate) }
                    composable("settings") {
                        SettingsScreen(
                            model,
                            user.name,
                            user.email,
                            authState.busy,
                            authState.error,
                            auth::signOut,
                            ::navigate,
                        )
                    }
                    composable("import") {
                        ImportScreen(importer, model, back) { id ->
                            nav.navigate("import/result/${Uri.encode(id)}") {
                                popUpTo("import") { inclusive = true }
                            }
                        }
                    }
                    composable("import/result/{id}") { current ->
                        ImportResultScreen(
                            current.arguments!!.getString("id")!!,
                            importer,
                            model,
                            back,
                        )
                    }
                    composable("export") { ExportScreen(model, transfer, back) }
                    composable("mortgage") {
                        val calculator: CalculatorViewModel = koinViewModel()
                        RepaymentScreen(true, calculator, currency, back)
                    }
                    composable("loan") {
                        val calculator: CalculatorViewModel = koinViewModel()
                        RepaymentScreen(false, calculator, currency, back)
                    }
                    composable("stamp-duty") { StampDutyScreen(back) }
                }
            }
        }
    }
}
