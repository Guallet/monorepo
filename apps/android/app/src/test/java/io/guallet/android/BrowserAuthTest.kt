package io.guallet.android

import io.guallet.android.core.network.*
import io.guallet.android.features.auth.data.*
import io.guallet.android.features.auth.domain.*
import io.guallet.android.features.auth.presentation.*
import io.ktor.client.engine.mock.*
import io.ktor.http.*
import io.ktor.http.content.OutgoingContent
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import kotlinx.serialization.json.*
import org.junit.*
import org.junit.Assert.*

@OptIn(ExperimentalCoroutinesApi::class)
class BrowserAuthTest {
    private val dispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(dispatcher)
    }

    @After
    fun cleanup() {
        Dispatchers.resetMain()
    }

    private val origin = "https://api.example.test"

    @Test
    fun `Google initiation uses native scheme and bridges purpose-prefixed state to browser`() =
        runTest(dispatcher) {
            val cookies = PersistentCookies(MemoryCookieStore(), origin)
            val client =
                createApiClient(
                    origin,
                    cookies,
                    MockEngine { request ->
                        assertEquals("/auth/sign-in/social", request.url.encodedPath)
                        assertFalse(
                            request.headers[HttpHeaders.Cookie]
                                .orEmpty()
                                .contains("guallet.native_flow")
                        )
                        val body =
                            Json.parseToJsonElement(
                                    (request.body as OutgoingContent.ByteArrayContent)
                                        .bytes()
                                        .decodeToString()
                                )
                                .jsonObject
                        assertEquals(
                            "guallet-android://login/callback?flow=test-flow",
                            body["callbackURL"]?.jsonPrimitive?.content,
                        )
                        respond(
                            """{"url":"https://accounts.google.com/o/oauth2/v2/auth?state=opaque","redirect":true}""",
                            headers =
                                headersOf(
                                    HttpHeaders.ContentType to listOf("application/json"),
                                    HttpHeaders.SetCookie to
                                        listOf(
                                            "__Secure-better-auth.oauth_state=signed-state; Path=/; Secure; HttpOnly; Max-Age=600"
                                        ),
                                ),
                        )
                    },
                )
            try {
                val repository =
                    KtorBrowserAuthRepository(
                        client,
                        cookies,
                        BetterAuthRepository(client, cookies),
                        origin,
                    )
                val result = Url(repository.startGoogle("test-flow"))
                assertEquals("/auth/expo-authorization-proxy", result.encodedPath)
                assertEquals("signed-state", result.parameters["oauthState"])
                assertEquals(
                    "https://accounts.google.com/o/oauth2/v2/auth?state=opaque",
                    result.parameters["authorizationURL"],
                )
                assertFalse(repository.consumeFlow("wrong"))
                assertTrue(repository.consumeFlow("test-flow"))
                assertFalse(repository.consumeFlow("test-flow"))
            } finally {
                client.close()
            }
        }

    @Test
    fun `session restoration preserves encrypted pending flow after process recreation`() =
        runTest(dispatcher) {
            for (status in listOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized)) {
                val store = MemoryCookieStore()
                val first = PersistentCookies(store, origin)
                first.addCookie(
                    Url("$origin/__native"),
                    Cookie(
                        "guallet.native_flow",
                        "pending",
                        maxAge = 600,
                        path = "/__native",
                        secure = true,
                    ),
                )
                first.addCookie(
                    Url(origin),
                    Cookie(
                        "__Secure-better-auth.session_token",
                        "expired",
                        maxAge = 600,
                        path = "/",
                        secure = true,
                    ),
                )
                val restored = PersistentCookies(store, origin)
                val client =
                    createApiClient(
                        origin,
                        restored,
                        MockEngine {
                            respond(
                                "null",
                                status,
                                headersOf(HttpHeaders.ContentType, "application/json"),
                            )
                        },
                    )
                try {
                    val auth = BetterAuthRepository(client, restored)
                    assertNull(auth.session())
                    assertTrue(restored.get(Url(origin)).isEmpty())
                    val browser = KtorBrowserAuthRepository(client, restored, auth, origin)
                    assertTrue(browser.consumeFlow("pending"))
                    assertFalse(browser.consumeFlow("pending"))
                } finally {
                    client.close()
                }
            }
        }

    @Test
    fun `OAuth cookies are checked against get-session before accepting a user`() =
        runTest(dispatcher) {
            val cookies = PersistentCookies(MemoryCookieStore(), origin)
            val client =
                createApiClient(
                    origin,
                    cookies,
                    MockEngine { request ->
                        assertEquals("/auth/get-session", request.url.encodedPath)
                        assertTrue(
                            request.headers[HttpHeaders.Cookie]
                                .orEmpty()
                                .contains("better-auth.session_token=signed")
                        )
                        assertFalse(
                            request.headers[HttpHeaders.Cookie].orEmpty().contains("unrelated")
                        )
                        respond(
                            """{"user":{"id":"1","name":"Alex","email":"alex@example.test"}}""",
                            headers = headersOf(HttpHeaders.ContentType, "application/json"),
                        )
                    },
                )
            try {
                val repository =
                    KtorBrowserAuthRepository(
                        client,
                        cookies,
                        BetterAuthRepository(client, cookies),
                        origin,
                    )
                val user =
                    repository.finishGoogle(
                        "__Secure-better-auth.session_token=signed; Path=/; Secure; HttpOnly; Max-Age=3600, unrelated=ignored; Path=/; Secure"
                    )
                assertEquals("1", user.id)
            } finally {
                client.close()
            }
        }

    @Test
    fun `cold-start callback waits for restoration and consumes flow once`() =
        runTest(dispatcher) {
            val browser = FakeBrowser().apply { pending = "expected" }
            val model = AuthViewModel(FakeSession(), browser)
            model.handleDeepLink("guallet-android://login/callback?flow=expected&cookie=session")
            advanceUntilIdle()
            assertTrue(model.state.value.session is SessionState.SignedIn)
            assertEquals(1, browser.finishes)
            model.handleDeepLink("guallet-android://login/callback?flow=expected&cookie=session")
            advanceUntilIdle()
            assertEquals(1, browser.finishes)
        }

    @Test
    fun `unsolicited callbacks cannot replace current session`() =
        runTest(dispatcher) {
            val browser = FakeBrowser()
            val model = AuthViewModel(FakeSession(), browser)
            advanceUntilIdle()
            model.handleDeepLink("guallet-android://login/callback?flow=attacker&cookie=session")
            advanceUntilIdle()
            assertEquals(SessionState.SignedOut, model.state.value.session)
            assertEquals(0, browser.finishes)
        }
}

private class FakeBrowser : BrowserAuthRepository {
    var pending: String? = null
    var finishes = 0

    override suspend fun startGoogle(flow: String): String {
        pending = flow
        return "https://api.example.test/auth/expo-authorization-proxy"
    }

    override suspend fun consumeFlow(flow: String): Boolean {
        if (pending != flow) return false
        pending = null
        return true
    }

    override suspend fun finishGoogle(cookie: String): AuthUser {
        finishes++
        return AuthUser("1", "Alex", "alex@example.test")
    }

    override suspend fun requestResetLink(email: String) = Unit

    override suspend fun resetWithToken(token: String, password: String) = Unit
}

private class FakeSession : AuthRepository {
    override suspend fun session(): AuthUser? = null

    override suspend fun signIn(email: String, password: String) = AuthUser("1", "Alex", email)

    override suspend fun signUp(name: String, email: String, password: String) =
        AuthUser("1", name, email)

    override suspend fun sendCode(email: String) = Unit

    override suspend fun verifyCode(email: String, code: String) = AuthUser("1", "Alex", email)

    override suspend fun requestReset(email: String) = Unit

    override suspend fun resetPassword(email: String, code: String, password: String) = Unit

    override suspend fun signOut() = Unit
}
