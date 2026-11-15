# Android review reproduction probes

Audited commit: `005e940b171bfb67df5b617001fd248c2f3462fd`.
These temporary tests assert the desired behaviour. On the audited app,
**eight probes completed: seven failed and the CSV timing probe passed**.
The committed application's separate 40-test suite had passed before the
review. These probes expose gaps in that coverage.

Run with JDK 17 and Android SDK 36. Place the Kotlin code below in
`app/src/test/java/io/guallet/android/AndroidReviewProbeTest.kt`, then run from
`apps/android`:

```sh
./gradlew :app:testDebugUnitTest --tests io.guallet.android.AndroidReviewProbeTest
```

A nonzero exit is expected at the audited commit. After reproduction, remove
the temporary Kotlin file. Convert the relevant probes into maintained
regressions as fixes land; keeping them as Markdown preserves runnable review
evidence without committing a deliberately failing test suite.

| Probe                                            | Observed result                                                        | Finding |
| ------------------------------------------------ | ---------------------------------------------------------------------- | ------- |
| Account editor restoration                       | Expected `Unsaved draft`; restored field contained `Original name`     | F02     |
| New recurring form dirty guard after restoration | Cancel called the navigation callback without discard confirmation     | F02     |
| Calculator result restoration                    | Retained ViewModel result became null                                  | F04     |
| Throwing browser handler                         | `IllegalArgumentException: No browser installed` escaped               | F05     |
| Cookie persistence execution context             | CookieStore.write ran on the main Looper                               | F06     |
| CSV validation profile                           | 20,000 rows, 2,228,925 bytes; validation 1,832 ms on this builder      | F07     |
| Mapping state size                               | Java serialisation 2,228,989 bytes; Robolectric Parcel 5,319,656 bytes | F09     |
| Checkbox semantics                               | Toggle node had role/state/actions but no visible option text          | F10     |

The CSV sample intentionally measures the initial unmapped state; that is also
validated by the current composable. Timing varies with hardware, JVM warm-up
and load. The mapping sample is synthetic high-cardinality input and is not an
actual device Binder transaction. Its raw serialised payload already exceeds
1 MB, independently of Robolectric's Parcel representation. Main-thread
persistence was observed through a recording CookieStore and MockEngine;
actual hardware Keystore latency remains unmeasured.

StateRestorationTester recreates the composition and saved state while
retaining the supplied ViewModel. This models the problematic configuration
restoration path; a device rotation/process-death matrix is still needed.
The browser failure is injected through UriHandler, rather than uninstalling
a browser on a device.

## Source

```kotlin
package io.guallet.android

import android.app.Application
import android.os.Bundle
import android.os.Looper
import android.os.Parcel
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

// Temporary review probes: these assert desired behaviour, so known defects fail.
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [29], application = Application::class)
class AndroidReviewProbeTest {
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
        assertEquals("Could not open the browser. Please try again.", auth.state.value.error)
    }

    @Test
    fun `profile CSV validation work on a supported file size`() {
        val raw =
            "date,amount,description,account\n" +
                (1..20_000).joinToString("\n") { "2026-11-13,12.34,${"x".repeat(80)},account-$it" }
        val rows = io.guallet.android.features.transfer.CsvParser.parse(raw).rows
        val fields =
            io.guallet.android.features.transfer.FieldMappings(
                date = "",
                amount = "",
                description = "",
            )
        val start = System.nanoTime()
        val valid =
            rows.count {
                io.guallet.android.features.transfer.CsvParser.rowErrors(it, fields).isEmpty()
            }
        println(
            "REVIEW_CSV_BYTES=${raw.toByteArray().size}; ROWS=${rows.size}; VALID=$valid; VALIDATION_MS=${(System.nanoTime() - start) / 1_000_000}"
        )
    }

    @Test
    fun `large mapping state remains below saved instance state transaction budget`() {
        // A 2.3 MB CSV can contain 20,000 distinct 100-character account names.
        val mappings = HashMap<String, String>()
        repeat(20_000) { mappings["account-$it-" + "x".repeat(90)] = "existing-account-id" }
        val state = Bundle().apply { putSerializable("accountMappings", mappings) }
        val parcel = Parcel.obtain()
        try {
            val buffer = java.io.ByteArrayOutputStream()
            java.io.ObjectOutputStream(buffer).use { it.writeObject(mappings) }
            println("REVIEW_MAPPING_SERIALIZED_BYTES=${buffer.size()}")
            parcel.writeBundle(state)
            println("REVIEW_MAPPING_BUNDLE_BYTES=${parcel.dataSize()}")
            assertTrue(
                "Mapping state alone must not exhaust Binder's shared 1 MB buffer",
                parcel.dataSize() < 1024 * 1024,
            )
        } finally {
            parcel.recycle()
        }
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
```
