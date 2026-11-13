package io.guallet.android

import android.app.Application
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import io.guallet.android.core.network.PersistentCookies
import io.guallet.android.core.network.createApiClient
import io.guallet.android.features.accounts.domain.*
import io.guallet.android.features.accounts.presentation.AccountsViewModel
import io.guallet.android.features.auth.domain.AuthUser
import io.guallet.android.features.auth.presentation.AuthViewModel
import io.guallet.android.features.calculators.CalculatorViewModel
import io.guallet.android.features.finance.data.KtorFinanceRepository
import io.guallet.android.features.finance.domain.FinanceRepository
import io.guallet.android.features.finance.presentation.FinanceViewModel
import io.guallet.android.features.transfer.*
import io.guallet.android.ui.NativeApp
import io.guallet.android.ui.NativeSessionScope
import io.guallet.android.ui.theme.GualletTheme
import io.ktor.client.engine.mock.*
import io.ktor.http.*
import java.math.BigDecimal
import org.junit.*
import org.junit.runner.RunWith
import org.koin.core.context.startKoin
import org.koin.core.context.stopKoin
import org.koin.core.module.dsl.viewModelOf
import org.koin.dsl.module
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [29], application = Application::class)
class NativeNavigationTest {
    @get:Rule val compose = createComposeRule()
    private val accounts = NavigationAccounts()
    private val cookies = PersistentCookies(MemoryCookieStore(), "https://api.example.test")
    private val client =
        createApiClient(
            "https://api.example.test",
            cookies,
            MockEngine { request ->
                val response =
                    when (request.url.encodedPath) {
                        "/users" ->
                            """{"name":"Alex","email":"alex@example.test","profile_src":null}"""
                        "/users/settings" ->
                            """{"currencies":{"default_currency":"GBP","preferred_currencies":["GBP"]},"date_format":"DD/MM/YYYY"}"""
                        "/transactions" ->
                            """{"meta":{"total":0,"page":1,"pageSize":50,"hasMore":false},"transactions":[]}"""
                        else -> "[]"
                    }
                respond(response, headers = headersOf(HttpHeaders.ContentType, "application/json"))
            },
        )

    @Before
    fun setup() {
        startKoin {
            modules(
                module {
                    single { io.guallet.android.core.state.AppDispatchers() }
                    single<AccountsRepository> { accounts }
                    single<FinanceRepository> { KtorFinanceRepository(client) }
                    single<TransferRepository> { KtorTransferRepository(client) }
                    viewModelOf(::NativeSessionScope)
                    viewModelOf(::FinanceViewModel)
                    viewModelOf(::AccountsViewModel)
                    viewModelOf(::CalculatorViewModel)
                    viewModelOf(::ImportViewModel)
                }
            )
        }
    }

    @After
    fun cleanup() {
        stopKoin()
        client.close()
    }

    @Test
    fun `signed-in navigation opens accounts and persists account edits`() {
        val auth = AuthViewModel(NavigationAuth())
        compose.setContent {
            GualletTheme { NativeApp(AuthUser("user-1", "Alex", "alex@example.test"), auth) }
        }
        compose.onNodeWithText("Hi, Alex").assertIsDisplayed()
        compose.onNodeWithText("Accounts").performClick()
        compose.onNode(hasScrollToIndexAction()).performScrollToNode(hasText("Everyday bank"))
        compose.onNodeWithText("View account").performScrollTo().performClick()
        compose.waitUntil(10_000) {
            compose.onAllNodesWithText("Edit").fetchSemanticsNodes().isNotEmpty()
        }
        compose.onNodeWithText("Edit").performScrollTo().performClick()
        compose.waitUntil(10_000) {
            compose.onAllNodesWithText("Account name").fetchSemanticsNodes().isNotEmpty()
        }
        compose.onNodeWithText("Account name").performTextReplacement("Updated bank")
        compose.onNodeWithText("Save account").performScrollTo().performClick()
        compose.waitUntil(10_000) { accounts.value.name == "Updated bank" }
        compose.waitUntil(10_000) {
            compose.onAllNodesWithText("Updated bank").fetchSemanticsNodes().isNotEmpty()
        }
        compose.onNodeWithText("Updated bank").assertIsDisplayed()
    }

    @Test
    fun `unsolicited reset link cannot dispose a signed-in account draft`() {
        val auth = AuthViewModel(NavigationAuth())
        compose.setContent { GualletTheme { io.guallet.android.ui.GualletApp(auth) } }
        compose.waitUntil(10_000) {
            compose.onAllNodesWithText("Hi, Alex").fetchSemanticsNodes().isNotEmpty()
        }
        compose.onNodeWithText("Accounts").performClick()
        compose.onNodeWithText("Add account").performClick()
        compose.onNodeWithText("Account name").performTextReplacement("Draft stays open")
        compose.runOnIdle {
            auth.handleDeepLink("guallet-android://login/reset-password?token=untrusted")
        }
        compose.onNodeWithText("Open password reset?").assertIsDisplayed()
        compose.onNodeWithText("Continue").performClick()
        compose.onNode(hasText("Cancel") and hasAnyAncestor(isDialog())).performClick()
        compose.onNodeWithText("Account name").assertTextContains("Draft stays open")
        compose.runOnIdle {
            auth.handleDeepLink("guallet-android://login/reset-password?token=untrusted-again")
        }
        compose
            .onAllNodesWithText("Cancel")
            .filter(hasAnyAncestor(isDialog()))
            .onFirst()
            .performClick()
        compose.onNodeWithText("Account name").assertTextContains("Draft stays open")
    }

    @Test
    fun `settings reaches native CSV document selection workflow`() {
        val auth = AuthViewModel(NavigationAuth())
        compose.setContent {
            GualletTheme { NativeApp(AuthUser("user-1", "Alex", "alex@example.test"), auth) }
        }
        compose.onNodeWithText("Settings").performClick()
        compose.onNodeWithText("Import transactions from CSV").performScrollTo().performClick()
        compose.onNodeWithText("Choose CSV file").assertIsDisplayed()
        compose.onNodeWithText("Import CSV · Step 1 of 5").assertIsDisplayed()
    }
}

private class NavigationAccounts : AccountsRepository {
    var value =
        Account(
            "account-1",
            "Everyday bank",
            "GBP",
            "current-account",
            AccountBalance(BigDecimal("123.45"), "GBP"),
            source = "manual",
        )

    override suspend fun list() = listOf(value)

    override suspend fun get(id: String) = value

    override suspend fun transactions(id: String) = emptyList<AccountTransaction>()

    override suspend fun create(input: AccountInput): Account {
        value =
            value.copy(name = input.name, balance = AccountBalance(input.balance, input.currency))
        return value
    }

    override suspend fun update(id: String, input: AccountInput) = create(input)

    override suspend fun delete(id: String) = Unit
}

private open class NavigationAuth : io.guallet.android.features.auth.domain.AuthRepository {
    private val user = AuthUser("user-1", "Alex", "alex@example.test")

    override suspend fun session() = user

    override suspend fun signIn(email: String, password: String) = user

    override suspend fun signUp(name: String, email: String, password: String) = user

    override suspend fun sendCode(email: String) = Unit

    override suspend fun verifyCode(email: String, code: String) = user

    override suspend fun requestReset(email: String) = Unit

    override suspend fun resetPassword(email: String, code: String, password: String) = Unit

    override suspend fun signOut() = Unit
}
