package io.guallet.android

import android.app.Application
import android.net.Uri
import android.os.Parcel
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.saveable.LocalSaveableStateRegistry
import androidx.compose.runtime.saveable.SaveableStateRegistry
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.StateRestorationTester
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.viewmodel.compose.LocalViewModelStoreOwner
import androidx.test.core.app.ApplicationProvider
import io.guallet.android.core.network.*
import io.guallet.android.features.accounts.domain.*
import io.guallet.android.features.accounts.presentation.*
import io.guallet.android.features.finance.data.KtorFinanceRepository
import io.guallet.android.features.finance.presentation.FinanceViewModel
import io.guallet.android.features.transfer.*
import io.guallet.android.ui.theme.GualletTheme
import io.ktor.client.engine.mock.*
import io.ktor.http.*
import java.io.File
import java.math.BigDecimal
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [29], application = Application::class)
class MemoryDraftTest {
    @get:Rule val compose = createComposeRule()

    private class Owner : ViewModelStoreOwner {
        override val viewModelStore = ViewModelStore()
    }

    private fun assertPrivateContentsNotSaved(registry: SaveableStateRegistry) {
        val saved = registry.performSave()
        assertFalse(saved.toString().contains("PRIVATE_"))
        val parcel = Parcel.obtain()
        try {
            parcel.writeMap(saved)
            assertTrue(
                "Drafts must leave a small saved-state payload, got ${parcel.dataSize()} bytes",
                parcel.dataSize() < 64 * 1024,
            )
            assertFalse(String(parcel.marshall(), Charsets.UTF_16LE).contains("PRIVATE_"))
            assertFalse(String(parcel.marshall(), Charsets.UTF_8).contains("PRIVATE_"))
        } finally {
            parcel.recycle()
        }
    }

    @Test
    fun `financial editor survives rotation without saving its contents and restarts after process death`() {
        var owner = Owner()
        var model = AccountsViewModel(DraftAccounts())
        var registry: SaveableStateRegistry? = null
        val restore = StateRestorationTester(compose)
        restore.setContent {
            CompositionLocalProvider(LocalViewModelStoreOwner provides owner) {
                registry = LocalSaveableStateRegistry.current
                GualletTheme { AccountFormScreen("account", model, "GBP", {}, {}) }
            }
        }
        compose.waitUntil(10_000) {
            compose.onAllNodesWithText("Account name").fetchSemanticsNodes().isNotEmpty()
        }
        compose.onNodeWithText("Account name").performTextReplacement("PRIVATE_ACCOUNT_DRAFT")
        compose.runOnIdle { assertPrivateContentsNotSaved(registry!!) }
        restore.emulateSavedInstanceStateRestore()
        compose.onNodeWithText("Account name").assertTextContains("PRIVATE_ACCOUNT_DRAFT")
        compose.runOnIdle {
            owner.viewModelStore.clear()
            owner = Owner()
            model = AccountsViewModel(DraftAccounts())
        }
        restore.emulateSavedInstanceStateRestore()
        compose.waitUntil(10_000) {
            compose.onAllNodesWithText("Account name").fetchSemanticsNodes().isNotEmpty()
        }
        compose.onNodeWithText("Account name").assertTextContains("Server account")
        compose.onNodeWithText("PRIVATE_ACCOUNT_DRAFT").assertDoesNotExist()
    }

    @Test
    fun `twenty thousand CSV mappings stay out of saved state and cannot outlive their document process`() {
        val client =
            createApiClient(
                "https://api.example.test",
                PersistentCookies(MemoryCookieStore(), "https://api.example.test"),
                MockEngine { request ->
                    val body =
                        when (request.url.encodedPath) {
                            "/users/settings" ->
                                """{"currencies":{"default_currency":"GBP","preferred_currencies":[]},"date_format":"DD/MM/YYYY"}"""
                            "/users" -> """{"name":"Alex","email":"alex@example.test"}"""
                            else -> "[]"
                        }
                    respond(body, headers = headersOf(HttpHeaders.ContentType, "application/json"))
                },
            )
        val transfer = KtorTransferRepository(client)
        var model = ImportViewModel(transfer)
        val finance = FinanceViewModel(KtorFinanceRepository(client), DraftAccounts())
        var registry: SaveableStateRegistry? = null
        val restore = StateRestorationTester(compose)
        val file = File.createTempFile("native-draft-test", ".csv")
        try {
            file.bufferedWriter().use { out ->
                out.write("date,amount,description,account\n")
                repeat(20_000) { out.write("2026-11-14,1,Transaction,PRIVATE_ACCOUNT_$it\n") }
            }
            restore.setContent {
                registry = LocalSaveableStateRegistry.current
                GualletTheme { ImportScreen(model, finance, {}, {}) }
            }
            val context = ApplicationProvider.getApplicationContext<Application>()
            val uri = Uri.parse("content://io.guallet.test/import.csv")
            val resolver = context.contentResolver
            val bytesRead = java.util.concurrent.atomic.AtomicInteger()
            org.robolectric.Shadows.shadowOf(resolver).registerInputStreamSupplier(uri) {
                object : java.io.FilterInputStream(file.inputStream()) {
                    override fun read(buffer: ByteArray, offset: Int, length: Int): Int {
                        val count = super.read(buffer, offset, length)
                        if (count > 0) bytesRead.addAndGet(count)
                        return count
                    }
                }
            }
            compose.runOnIdle { model.read(resolver, uri) }
            try {
                compose.waitUntil(30_000) {
                    compose.waitForIdle()
                    !model.busy.value
                }
            } catch (error: Exception) {
                throw AssertionError(
                    "Read ${bytesRead.get()}/${file.length()} bytes; failure=${model.error.value}",
                    error,
                )
            }
            compose.runOnIdle {
                assertNull(model.error.value?.resolve(context.resources), model.error.value)
                assertNotNull(model.data.value)
            }
            compose.onNodeWithText("Map columns").performScrollTo().performClick()
            compose.runOnIdle {
                model.updateDraft {
                    it.copy(
                        mappings =
                            mapOf(
                                "date" to "date",
                                "amount" to "amount",
                                "description" to "description",
                                "account" to "account",
                            ),
                        accountMappings =
                            (0 until 20_000).associate { "PRIVATE_ACCOUNT_$it" to "__create__" },
                        accountNames =
                            (0 until 20_000).associate {
                                "PRIVATE_ACCOUNT_$it" to "PRIVATE_NAME_$it".repeat(4)
                            },
                    )
                }
            }
            compose.waitUntil(30_000) {
                compose.onAllNodesWithText("Continue to accounts").fetchSemanticsNodes().any {
                    it.config
                        .contains(androidx.compose.ui.semantics.SemanticsProperties.Disabled)
                        .not()
                }
            }
            compose.onNodeWithText("Continue to accounts").performScrollTo().performClick()
            compose.waitUntil(30_000) {
                compose.onAllNodesWithText("New account name").fetchSemanticsNodes().isNotEmpty()
            }
            compose.runOnIdle {
                assertEquals(20_000, model.draft.value.accountMappings.size)
                assertPrivateContentsNotSaved(registry!!)
            }
            restore.emulateSavedInstanceStateRestore()
            assertEquals(20_000, model.draft.value.accountMappings.size)
            compose.runOnIdle { model = ImportViewModel(transfer) }
            restore.emulateSavedInstanceStateRestore()
            compose.waitForIdle()
            compose.onNodeWithText("Choose CSV file").assertIsDisplayed()
            assertNull(model.data.value)
            assertTrue(model.draft.value.accountMappings.isEmpty())
        } finally {
            file.delete()
            client.close()
        }
    }
}

private class DraftAccounts : AccountsRepository {
    private val item =
        Account(
            "account",
            "Server account",
            "GBP",
            "current-account",
            AccountBalance(BigDecimal.TEN, "GBP"),
        )

    override suspend fun list() = listOf(item)

    override suspend fun get(id: String) = item

    override suspend fun transactions(id: String) = emptyList<AccountTransaction>()

    override suspend fun create(input: AccountInput) = item

    override suspend fun update(id: String, input: AccountInput) = item

    override suspend fun delete(id: String) = Unit
}
