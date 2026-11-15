package io.guallet.android

import io.guallet.android.core.network.*
import io.guallet.android.features.auth.data.*
import io.guallet.android.features.auth.domain.*
import io.guallet.android.features.auth.presentation.*
import io.ktor.client.engine.mock.*
import io.ktor.http.*
import io.ktor.http.content.OutgoingContent
import java.security.MessageDigest
import java.util.Base64
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import kotlinx.serialization.json.*
import org.junit.*
import org.junit.Assert.*

@OptIn(ExperimentalCoroutinesApi::class)
class BrowserAuthTest {
    private val dispatcher = StandardTestDispatcher()
    private val origin = "https://api.example.test"
    private val flow = "A".repeat(43)
    private val code = "C".repeat(43)

    private fun requestBody(request: io.ktor.client.request.HttpRequestData) =
        Json.parseToJsonElement(
                (request.body as OutgoingContent.ByteArrayContent).bytes().decodeToString()
            )
            .jsonObject

    private fun jsonHeaders() = headersOf(HttpHeaders.ContentType, "application/json")

    @Before
    fun setup() {
        Dispatchers.setMain(dispatcher)
    }

    @After
    fun cleanup() {
        Dispatchers.resetMain()
    }

    @Test
    fun `native start sends only a challenge and completion redeems with a private verifier over HTTPS`() =
        runTest(dispatcher) {
            val store = MemoryCookieStore()
            val cookies = PersistentCookies(store, origin)
            var challenge: String? = null
            var exchanges = 0
            val client =
                createApiClient(
                    origin,
                    cookies,
                    MockEngine { request ->
                        assertFalse(
                            request.headers[HttpHeaders.Cookie]
                                .orEmpty()
                                .contains("guallet.native_")
                        )
                        assertEquals("guallet-android://", request.headers[HttpHeaders.Origin])
                        when (request.url.encodedPath) {
                            "/native-auth/google" -> {
                                val body = requestBody(request)
                                assertEquals(setOf("challenge"), body.keys)
                                challenge = body.getValue("challenge").jsonPrimitive.content
                                respond(
                                    """{"flowId":"$flow","expiresIn":600,"browserUrl":"$origin/native-auth/google/start?flowId=$flow"}""",
                                    headers = jsonHeaders(),
                                )
                            }
                            "/native-auth/google/exchange" -> {
                                exchanges++
                                val body = requestBody(request)
                                assertEquals(setOf("flowId", "code", "verifier"), body.keys)
                                assertEquals(flow, body.getValue("flowId").jsonPrimitive.content)
                                assertEquals(code, body.getValue("code").jsonPrimitive.content)
                                val verifier = body.getValue("verifier").jsonPrimitive.content
                                assertEquals(
                                    challenge,
                                    Base64.getUrlEncoder()
                                        .withoutPadding()
                                        .encodeToString(
                                            MessageDigest.getInstance("SHA-256")
                                                .digest(verifier.toByteArray())
                                        ),
                                )
                                respond(
                                    """{"success":true}""",
                                    headers =
                                        headersOf(
                                            HttpHeaders.ContentType to listOf("application/json"),
                                            HttpHeaders.SetCookie to
                                                listOf(
                                                    "__Secure-better-auth.session_token=signed; Path=/; Secure; HttpOnly; Max-Age=3600"
                                                ),
                                        ),
                                )
                            }
                            "/auth/get-session" -> {
                                assertTrue(
                                    request.headers[HttpHeaders.Cookie]
                                        .orEmpty()
                                        .contains("session_token=signed")
                                )
                                respond(
                                    """{"user":{"id":"1","name":"Alex","email":"alex@example.test"}}""",
                                    headers = jsonHeaders(),
                                )
                            }
                            else -> error("Unexpected ${request.url.encodedPath}")
                        }
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
                val url = repository.startGoogle()
                assertEquals(setOf("flowId"), Url(url).parameters.names())
                assertFalse(url.contains("verifier"))
                // Encrypted vault contents survive a new cookie-store/repository instance.
                val restored =
                    KtorBrowserAuthRepository(
                        client,
                        PersistentCookies(store, origin),
                        BetterAuthRepository(client, cookies),
                        origin,
                    )
                assertTrue(
                    restored.acceptsCallback(
                        NativeCallback(BrowserFlowKind.Google, NativeHandoff(flow, code))
                    )
                )
                assertFalse(
                    restored.acceptsCallback(
                        NativeCallback(BrowserFlowKind.Reset, NativeHandoff(flow, code))
                    )
                )
                assertEquals("1", repository.finishGoogle(NativeHandoff(flow, code)).id)
                assertFalse(
                    repository.acceptsCallback(
                        NativeCallback(BrowserFlowKind.Google, NativeHandoff(flow, code))
                    )
                )
                assertTrue(
                    runCatching { repository.finishGoogle(NativeHandoff(flow, code)) }.isFailure
                )
                assertEquals(1, exchanges)
            } finally {
                client.close()
            }
        }

    @Test
    fun `a rejected exchange does not discard the legitimate pending verifier`() =
        runTest(dispatcher) {
            val cookies = PersistentCookies(MemoryCookieStore(), origin)
            val client =
                createApiClient(
                    origin,
                    cookies,
                    MockEngine { request ->
                        if (request.url.encodedPath == "/native-auth/google")
                            respond(
                                """{"flowId":"$flow","expiresIn":600,"browserUrl":"$origin/native-auth/google/start?flowId=$flow"}""",
                                headers = jsonHeaders(),
                            )
                        else respond("{}", HttpStatusCode.BadRequest, jsonHeaders())
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
                repository.startGoogle()
                assertTrue(
                    runCatching { repository.finishGoogle(NativeHandoff(flow, code)) }.isFailure
                )
                assertTrue(
                    repository.acceptsCallback(
                        NativeCallback(BrowserFlowKind.Google, NativeHandoff(flow, code))
                    )
                )
            } finally {
                client.close()
            }
        }

    @Test
    fun `a browser URL outside the exact API start endpoint is rejected before persisting a verifier`() =
        runTest(dispatcher) {
            val cookies = PersistentCookies(MemoryCookieStore(), origin)
            val client =
                createApiClient(
                    origin,
                    cookies,
                    MockEngine {
                        respond(
                            """{"flowId":"$flow","expiresIn":600,"browserUrl":"https://attacker.example/native-auth/google/start?flowId=$flow"}""",
                            headers = jsonHeaders(),
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
                assertTrue(runCatching { repository.startGoogle() }.isFailure)
                assertTrue(cookies.get(Url("$origin/__native")).isEmpty())
            } finally {
                client.close()
            }
        }

    @Test
    fun `reset completion sends the handoff and verifier without accepting reset tokens from URLs`() =
        runTest(dispatcher) {
            val cookies = PersistentCookies(MemoryCookieStore(), origin)
            var challenge: String? = null
            val client =
                createApiClient(
                    origin,
                    cookies,
                    MockEngine { request ->
                        val body = requestBody(request)
                        when (request.url.encodedPath) {
                            "/native-auth/reset" -> {
                                assertEquals(setOf("challenge", "email"), body.keys)
                                challenge = body.getValue("challenge").jsonPrimitive.content
                                respond(
                                    """{"flowId":"$flow","expiresIn":600}""",
                                    headers = jsonHeaders(),
                                )
                            }
                            "/native-auth/reset/complete" -> {
                                assertEquals(
                                    setOf("flowId", "code", "verifier", "newPassword"),
                                    body.keys,
                                )
                                assertFalse(request.url.toString().contains("password"))
                                assertFalse(body.containsKey("token"))
                                assertEquals(
                                    "new-password",
                                    body.getValue("newPassword").jsonPrimitive.content,
                                )
                                assertEquals(
                                    challenge,
                                    Base64.getUrlEncoder()
                                        .withoutPadding()
                                        .encodeToString(
                                            MessageDigest.getInstance("SHA-256")
                                                .digest(
                                                    body
                                                        .getValue("verifier")
                                                        .jsonPrimitive
                                                        .content
                                                        .toByteArray()
                                                )
                                        ),
                                )
                                respond("""{"success":true}""", headers = jsonHeaders())
                            }
                            else -> error("Unexpected endpoint")
                        }
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
                repository.requestResetLink("alex@example.test")
                assertTrue(
                    repository.acceptsCallback(
                        NativeCallback(BrowserFlowKind.Reset, NativeHandoff(flow, code))
                    )
                )
                repository.completeReset(NativeHandoff(flow, code), "new-password")
                assertTrue(cookies.get(Url("$origin/__native")).isEmpty())
            } finally {
                client.close()
            }
        }

    @Test
    fun `callback parsing accepts only two bounded non-credential fields`() {
        assertNotNull(parseNativeCallback("guallet-android://login/callback?flow=$flow&code=$code"))
        for (value in
            listOf(
                "guallet-android://login/reset-password?token=secret",
                "guallet-android://login/callback?flow=$flow&code=$code&cookie=secret",
                "guallet-android://login/callback?flow=$flow&flow=$flow&code=$code",
                "guallet-android://login:443/callback?flow=$flow&code=$code",
                "guallet-android://login/callback?flow=$flow&code=$code#token=secret",
            )) assertNull(value, parseNativeCallback(value))
    }

    @Test
    fun `cold-start callback waits for restoration and cannot be replayed`() =
        runTest(dispatcher) {
            val browser = FakeBrowser().apply { pending = flow }
            val model = AuthViewModel(FakeSession(), browser)
            model.handleDeepLink("guallet-android://login/callback?flow=$flow&code=$code")
            advanceUntilIdle()
            assertTrue(model.state.value.session is SessionState.SignedIn)
            assertEquals(1, browser.finishes)
            model.handleDeepLink("guallet-android://login/callback?flow=$flow&code=$code")
            advanceUntilIdle()
            assertEquals(1, browser.finishes)
        }

    @Test
    fun `unsolicited callbacks cannot replace a session or open reset UI`() =
        runTest(dispatcher) {
            val browser = FakeBrowser()
            val model = AuthViewModel(FakeSession(), browser)
            advanceUntilIdle()
            model.handleDeepLink("guallet-android://login/reset-password?flow=$flow&code=$code")
            advanceUntilIdle()
            assertNull(model.state.value.pendingResetHandoff)
            model.handleDeepLink("guallet-android://login/callback?flow=$flow&code=$code")
            advanceUntilIdle()
            assertEquals(SessionState.SignedOut, model.state.value.session)
            assertEquals(0, browser.finishes)
        }

    @Test
    fun `session restoration does not clear a private pending verifier`() =
        runTest(dispatcher) {
            val cookies = PersistentCookies(MemoryCookieStore(), origin)
            val client =
                createApiClient(
                    origin,
                    cookies,
                    MockEngine { request ->
                        if (request.url.encodedPath == "/native-auth/google")
                            respond(
                                """{"flowId":"$flow","expiresIn":600,"browserUrl":"$origin/native-auth/google/start?flowId=$flow"}""",
                                headers = jsonHeaders(),
                            )
                        else respond("null", HttpStatusCode.Unauthorized, jsonHeaders())
                    },
                )
            try {
                val auth = BetterAuthRepository(client, cookies)
                val browser = KtorBrowserAuthRepository(client, cookies, auth, origin)
                browser.startGoogle()
                assertNull(auth.session())
                assertTrue(
                    browser.acceptsCallback(
                        NativeCallback(BrowserFlowKind.Google, NativeHandoff(flow, code))
                    )
                )
            } finally {
                client.close()
            }
        }
}

private class FakeBrowser : BrowserAuthRepository {
    var pending: String? = null
    var finishes = 0

    override suspend fun startGoogle() = "https://api.example.test/native-auth/google/start"

    override suspend fun acceptsCallback(callback: NativeCallback) =
        pending == callback.handoff.flowId

    override suspend fun finishGoogle(handoff: NativeHandoff): AuthUser {
        pending = null
        finishes++
        return AuthUser("1", "Alex", "alex@example.test")
    }

    override suspend fun requestResetLink(email: String) = Unit

    override suspend fun completeReset(handoff: NativeHandoff, password: String) = Unit
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
