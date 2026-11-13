package io.guallet.android.features.auth.data

import io.guallet.android.core.network.PersistentCookies
import io.guallet.android.features.auth.domain.AuthUser
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.resources.post
import io.ktor.client.request.header
import io.ktor.client.request.setBody
import io.ktor.http.URLBuilder
import io.ktor.http.Url
import io.ktor.http.parseServerSetCookieHeader
import io.ktor.resources.Resource
import java.net.URI
import java.net.URLDecoder
import kotlinx.serialization.Serializable

@Resource("/auth/sign-in/social") class SocialResource

@Resource("/auth/request-password-reset") class ResetLinkResource

@Resource("/auth/reset-password") class ResetTokenResource

interface BrowserAuthRepository {
    suspend fun startGoogle(flow: String): String

    suspend fun consumeFlow(flow: String): Boolean

    suspend fun finishGoogle(cookie: String): AuthUser

    suspend fun requestResetLink(email: String)

    suspend fun resetWithToken(token: String, password: String)
}

class KtorBrowserAuthRepository(
    private val client: HttpClient,
    private val cookies: PersistentCookies,
    private val auth: io.guallet.android.features.auth.domain.AuthRepository,
    private val baseUrl: String,
) : BrowserAuthRepository {
    @Serializable
    private data class SocialInput(
        val callbackURL: String,
        val errorCallbackURL: String,
        val provider: String = "google",
    )

    @Serializable private data class SocialResult(val url: String)

    @Serializable
    private data class LinkInput(
        val email: String,
        val redirectTo: String = "guallet-android://login/reset-password",
    )

    @Serializable private data class TokenInput(val token: String, val newPassword: String)

    override suspend fun startGoogle(flow: String): String {
        cookies.addCookie(
            Url(baseUrl.trimEnd('/') + "/__native"),
            io.ktor.http.Cookie(
                name = "guallet.native_flow",
                value = flow,
                maxAge = 600,
                path = "/__native",
                secure = true,
                httpOnly = true,
            ),
        )
        val callback = "guallet-android://login/callback?flow=$flow"
        val result =
            client
                .post(SocialResource()) {
                    header("expo-origin", "guallet-android://")
                    header("x-skip-oauth-proxy", "true")
                    setBody(SocialInput(callback, callback))
                }
                .body<SocialResult>()
        val authorization = URI(result.url)
        require(authorization.scheme == "https" && authorization.host != null) {
            "Invalid authentication redirect."
        }
        val state =
            cookies
                .get(Url(baseUrl.trimEnd('/') + "/auth/sign-in/social"))
                .firstOrNull { it.name.removePrefix("__Secure-") == "better-auth.oauth_state" }
                ?.value
        // Reuse the installed Better Auth Expo plugin's browser cookie bridge; no Expo runtime is
        // embedded.
        return URLBuilder(baseUrl.trimEnd('/') + "/auth/expo-authorization-proxy")
            .apply {
                parameters.append("authorizationURL", result.url)
                if (state != null) parameters.append("oauthState", state)
            }
            .buildString()
    }

    override suspend fun consumeFlow(flow: String): Boolean {
        val url = Url(baseUrl.trimEnd('/') + "/__native")
        val pending =
            cookies.get(url).firstOrNull { it.name == "guallet.native_flow" } ?: return false
        if (pending.value != flow) return false
        cookies.addCookie(
            url,
            io.ktor.http.Cookie(
                name = pending.name,
                value = "",
                maxAge = 0,
                path = "/__native",
                secure = true,
            ),
        )
        return true
    }

    override suspend fun finishGoogle(cookie: String): AuthUser {
        require(cookie.length <= 32768) { "Invalid authentication callback." }
        val accepted =
            cookie
                .split(Regex(",(?=\\s*[^;,=\\s]+=)"))
                .map { parseServerSetCookieHeader(it.trim()) }
                .filter {
                    it.name.removePrefix("__Secure-") in
                        setOf("better-auth.session_token", "better-auth.session_data")
                }
        require(accepted.any { it.name.endsWith("session_token") && it.value.isNotBlank() }) {
            "No session was returned. Please try signing in again."
        }
        cookies.clear()
        accepted.forEach { cookies.addCookie(Url(baseUrl), it) }
        return auth.session()
            ?: throw IllegalArgumentException("Could not verify the returned session.")
    }

    override suspend fun requestResetLink(email: String) {
        client.post(ResetLinkResource()) { setBody(LinkInput(email)) }
    }

    override suspend fun resetWithToken(token: String, password: String) {
        client.post(ResetTokenResource()) { setBody(TokenInput(token, password)) }
        cookies.clear()
    }
}

data class NativeCallback(val path: String, val parameters: Map<String, String>)

fun parseNativeCallback(value: String): NativeCallback? =
    runCatching {
            require(value.length <= 65536)
            val uri = URI(value)
            require(
                uri.scheme == "guallet-android" &&
                    uri.host == "login" &&
                    uri.userInfo == null &&
                    uri.fragment == null
            )
            require(uri.path in setOf("/callback", "/reset-password"))
            val pairs =
                uri.rawQuery
                    .orEmpty()
                    .split('&')
                    .filter { it.isNotBlank() }
                    .map {
                        val parts = it.split('=', limit = 2)
                        URLDecoder.decode(parts[0], "UTF-8") to
                            URLDecoder.decode(parts.getOrElse(1) { "" }, "UTF-8")
                    }
            require(pairs.map { it.first }.distinct().size == pairs.size)
            NativeCallback(uri.path, pairs.toMap())
        }
        .getOrNull()
