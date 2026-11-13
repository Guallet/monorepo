package io.guallet.android

import android.app.Application
import android.os.Looper
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.StateRestorationTester
import androidx.compose.ui.test.junit4.createComposeRule
import io.guallet.android.core.network.*
import io.guallet.android.core.security.CookieStore
import io.guallet.android.features.accounts.domain.*
import io.guallet.android.features.accounts.presentation.*
import io.guallet.android.features.auth.data.BetterAuthRepository
import io.guallet.android.features.calculators.*
import io.guallet.android.ui.components.MultiChoice
import io.guallet.android.ui.theme.GualletTheme
import io.ktor.client.engine.mock.*
import io.ktor.http.*
import java.math.BigDecimal
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

// Regression assertions for the lifecycle, accessibility and networking review findings.
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [29], application = Application::class)
class AndroidReviewRegressionTest {
    @get:Rule val compose = createComposeRule()

    @Test
    fun `account edit draft survives saved state restoration`() {
        val repository = ReviewAccounts()
        val model = AccountsViewModel(repository)
        val restoration = StateRestorationTester(compose)
        restoration.setContent {
            GualletTheme { AccountFormScreen("account", model, "GBP", {}, {}) }
        }
        compose.waitUntil(10_000) {
            compose.onAllNodesWithText("Account name").fetchSemanticsNodes().isNotEmpty()
        }
        compose.onNodeWithText("Account name").performTextReplacement("Unsaved draft")
        restoration.emulateSavedInstanceStateRestore()
        compose.waitUntil(10_000) {
            repository.loads >= 2 &&
                compose.onAllNodesWithText("Account name").fetchSemanticsNodes().isNotEmpty() &&
                !model.state.value.detailsLoading
        }
        compose.onNodeWithText("Account name").assertTextContains("Unsaved draft")
    }

    @Test
    fun `calculator results survive saved state restoration`() {
        val model = CalculatorViewModel()
        val restoration = StateRestorationTester(compose)
        restoration.setContent { GualletTheme { RepaymentScreen(false, model, "GBP", {}) } }
        compose.onNodeWithText("Calculate").performScrollTo().performClick()
        compose.waitUntil(10_000) {
            compose.onAllNodesWithText("View payment schedule").fetchSemanticsNodes().isNotEmpty()
        }
        compose.waitForIdle()
        restoration.emulateSavedInstanceStateRestore()
        compose.waitForIdle()
        assertNotNull(
            "Previously calculated results should survive recreation",
            model.state.value.first,
        )
    }

    @Test
    fun `checkbox accessibility node includes its visible option label`() {
        compose.setContent {
            GualletTheme {
                MultiChoice("Accounts", emptySet(), listOf("account" to "Everyday bank")) {}
            }
        }
        compose.onNode(isToggleable()).assert(hasText("Everyday bank"))
    }

    @Test
    fun `RTL selection retains a labelled touch target with a long option`() {
        val label = "An account name that wraps across several lines ".repeat(4)
        compose.setContent {
            androidx.compose.runtime.CompositionLocalProvider(
                androidx.compose.ui.platform.LocalLayoutDirection provides
                    androidx.compose.ui.unit.LayoutDirection.Rtl
            ) {
                GualletTheme { MultiChoice("Accounts", emptySet(), listOf("id" to label)) {} }
            }
        }
        compose.onNode(isToggleable()).assert(hasText(label)).assertHasClickAction()
    }

    @Test
    fun `cookie persistence does not run on the main thread`() = runBlocking {
        var wroteOnMain = false
        val store =
            object : CookieStore {
                override fun read(): String? = null

                override fun write(value: String) {
                    wroteOnMain = Looper.myLooper() == Looper.getMainLooper()
                }
            }
        val cookies = PersistentCookies(store, "https://api.example.test")
        val client =
            createApiClient(
                "https://api.example.test",
                cookies,
                MockEngine {
                    respond(
                        """{"user":{"id":"1","name":"Alex","email":"alex@example.test"}}""",
                        headers =
                            headersOf(
                                HttpHeaders.ContentType to listOf("application/json"),
                                HttpHeaders.SetCookie to
                                    listOf("better-auth.session_token=token; Path=/; Secure"),
                            ),
                    )
                },
            )
        try {
            BetterAuthRepository(client, cookies).signIn("alex@example.test", "password")
            assertFalse("Keystore and synchronous commit must be moved off Main", wroteOnMain)
        } finally {
            client.close()
        }
    }

    @Test
    fun `restored new form still confirms discarding unsaved input`() {
        val client =
            createApiClient(
                "https://api.example.test",
                PersistentCookies(
                    object : CookieStore {
                        override fun read(): String? = null

                        override fun write(value: String) = Unit
                    },
                    "https://api.example.test",
                ),
                MockEngine {
                    respond("[]", headers = headersOf(HttpHeaders.ContentType, "application/json"))
                },
            )
        val model =
            io.guallet.android.features.finance.presentation.FinanceViewModel(
                io.guallet.android.features.finance.data.KtorFinanceRepository(client),
                ReviewAccounts(),
            )
        var leftForm = false
        val restoration = StateRestorationTester(compose)
        try {
            restoration.setContent {
                GualletTheme {
                    io.guallet.android.features.planning.RecurringFormScreen(
                        null,
                        model,
                        "GBP",
                        { leftForm = true },
                    )
                }
            }
            compose.onNodeWithText("Name").performTextReplacement("Unsaved recurring item")
            restoration.emulateSavedInstanceStateRestore()
            compose.onNodeWithText("Name").assertTextContains("Unsaved recurring item")
            compose.onNodeWithText("Cancel").performScrollTo().performClick()
            assertFalse("Restored draft should request discard confirmation", leftForm)
        } finally {
            client.close()
        }
    }

    @Test
    fun `applied transaction filters survive a new ViewModel after restoration`() {
        val client =
            createApiClient(
                "https://api.example.test",
                PersistentCookies(
                    object : CookieStore {
                        override fun read(): String? = null

                        override fun write(value: String) = Unit
                    },
                    "https://api.example.test",
                ),
                MockEngine { request ->
                    respond(
                        if (request.url.encodedPath == "/transactions")
                            """{"meta":{"total":0,"page":1,"pageSize":50,"hasMore":false},"transactions":[]}"""
                        else "[]",
                        headers = headersOf(HttpHeaders.ContentType, "application/json"),
                    )
                },
            )
        fun newModel() =
            io.guallet.android.features.finance.presentation.FinanceViewModel(
                io.guallet.android.features.finance.data.KtorFinanceRepository(client),
                ReviewAccounts(),
            )
        var currentModel = newModel()
        val restoration = StateRestorationTester(compose)
        try {
            restoration.setContent {
                GualletTheme {
                    io.guallet.android.features.transactions.presentation.TransactionsScreen(
                        currentModel,
                        {},
                        {},
                    )
                }
            }
            compose.onNodeWithText("Filters").performClick()
            compose
                .onNodeWithText("Start date (YYYY-MM-DD)")
                .performScrollTo()
                .performTextReplacement("2026-10-01")
            compose.onNodeWithText("Apply filters").performScrollTo().performClick()
            compose.waitUntil(10_000) { currentModel.transactionFilter.startDate != null }
            val applied = currentModel.transactionFilter
            compose.runOnIdle { currentModel = newModel() }
            assertNull(currentModel.transactionFilter.startDate)
            restoration.emulateSavedInstanceStateRestore()
            compose.waitUntil(10_000) { currentModel.transactionFilter == applied }
        } finally {
            client.close()
        }
    }

    @Test
    fun `import status stops polling while its screen lifecycle is stopped`() {
        val calls = java.util.concurrent.atomic.AtomicInteger()
        val transfer =
            object : io.guallet.android.features.transfer.TransferRepository {
                override suspend fun submit(
                    request: io.guallet.android.features.transfer.ImportRequest
                ) = error("Unused")

                override suspend fun status(
                    jobId: String
                ): io.guallet.android.features.transfer.ImportStatus {
                    calls.incrementAndGet()
                    return io.guallet.android.features.transfer.ImportStatus(
                        "processing",
                        10.0,
                        1,
                        0,
                    )
                }

                override suspend fun export(
                    request: io.guallet.android.features.transfer.ExportRequest
                ) = error("Unused")
            }
        val owner =
            object : androidx.lifecycle.LifecycleOwner {
                val registry = androidx.lifecycle.LifecycleRegistry(this)
                override val lifecycle: androidx.lifecycle.Lifecycle
                    get() = registry
            }
        val client =
            createApiClient(
                "https://api.example.test",
                PersistentCookies(
                    object : CookieStore {
                        override fun read(): String? = null

                        override fun write(value: String) = Unit
                    },
                    "https://api.example.test",
                ),
                MockEngine {
                    respond("[]", headers = headersOf(HttpHeaders.ContentType, "application/json"))
                },
            )
        val model = io.guallet.android.features.transfer.ImportViewModel(transfer)
        val finance =
            io.guallet.android.features.finance.presentation.FinanceViewModel(
                io.guallet.android.features.finance.data.KtorFinanceRepository(client),
                ReviewAccounts(),
            )
        try {
            compose.runOnIdle {
                owner.registry.currentState = androidx.lifecycle.Lifecycle.State.STARTED
            }
            compose.setContent {
                androidx.compose.runtime.CompositionLocalProvider(
                    androidx.lifecycle.compose.LocalLifecycleOwner provides owner
                ) {
                    GualletTheme {
                        io.guallet.android.features.transfer.ImportResultScreen(
                            "job",
                            model,
                            finance,
                            {},
                        )
                    }
                }
            }
            compose.waitUntil(10_000) { calls.get() > 0 }
            compose.runOnIdle {
                owner.registry.currentState = androidx.lifecycle.Lifecycle.State.CREATED
            }
            compose.waitForIdle()
            val stoppedAt = calls.get()
            Thread.sleep(2200)
            compose.waitForIdle()
            assertEquals("Background screen must stop polling", stoppedAt, calls.get())
            compose.runOnIdle {
                owner.registry.currentState = androidx.lifecycle.Lifecycle.State.STARTED
            }
            compose.waitUntil(10_000) { calls.get() > stoppedAt }
        } finally {
            compose.runOnIdle {
                owner.registry.currentState = androidx.lifecycle.Lifecycle.State.DESTROYED
            }
            client.close()
        }
    }

    @Test
    fun `Google browser launch failure becomes recoverable UI feedback`() {
        val browser =
            object : io.guallet.android.features.auth.data.BrowserAuthRepository {
                override suspend fun startGoogle(flow: String) =
                    "https://api.example.test/auth/expo-authorization-proxy"

                override suspend fun consumeFlow(flow: String) = false

                override suspend fun finishGoogle(cookie: String) = error("Not used")

                override suspend fun requestResetLink(email: String) = Unit

                override suspend fun resetWithToken(token: String, password: String) = Unit
            }
        val auth =
            io.guallet.android.features.auth.presentation.AuthViewModel(
                ReviewSignedOutAuth(),
                browser,
            )
        compose.setContent {
            androidx.compose.runtime.CompositionLocalProvider(
                androidx.compose.ui.platform.LocalUriHandler provides
                    object : androidx.compose.ui.platform.UriHandler {
                        override fun openUri(uri: String) {
                            throw IllegalArgumentException("No browser installed")
                        }
                    }
            ) {
                GualletTheme { io.guallet.android.ui.GualletApp(auth) }
            }
        }
        compose.onNodeWithText("Continue with Google").performClick()
        compose.waitForIdle()
        assertEquals(
            io.guallet.android.core.state.uiMessage(
                R.string.message_could_not_open_the_browser_please_try_again
            ),
            auth.state.value.error,
        )
    }
}

private class ReviewAccounts : AccountsRepository {
    var loads = 0
    private val value =
        Account(
            "account",
            "Original name",
            "GBP",
            "current-account",
            AccountBalance(BigDecimal("123.45"), "GBP"),
        )

    override suspend fun list() = listOf(value)

    override suspend fun get(id: String): Account {
        loads++
        delay(250)
        return value
    }

    override suspend fun transactions(id: String) = emptyList<AccountTransaction>()

    override suspend fun create(input: AccountInput) = value

    override suspend fun update(id: String, input: AccountInput) = value

    override suspend fun delete(id: String) = Unit
}

private class ReviewSignedOutAuth : io.guallet.android.features.auth.domain.AuthRepository {
    override suspend fun session(): io.guallet.android.features.auth.domain.AuthUser? = null

    override suspend fun signIn(email: String, password: String) = error("Not used")

    override suspend fun signUp(name: String, email: String, password: String) = error("Not used")

    override suspend fun sendCode(email: String) = Unit

    override suspend fun verifyCode(email: String, code: String) = error("Not used")

    override suspend fun requestReset(email: String) = Unit

    override suspend fun resetPassword(email: String, code: String, password: String) = Unit

    override suspend fun signOut() = Unit
}
