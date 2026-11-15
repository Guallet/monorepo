package io.guallet.android.features.auth.data

import io.guallet.android.R
import io.guallet.android.core.network.PersistentCookies
import io.guallet.android.core.state.*
import io.guallet.android.features.auth.domain.AuthRepository
import io.guallet.android.features.auth.domain.AuthUser
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.resources.post
import io.ktor.client.request.setBody
import io.ktor.http.Cookie
import io.ktor.http.Url
import io.ktor.resources.Resource
import java.net.URI
import java.net.URLDecoder
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64
import kotlinx.serialization.Serializable

@Resource("/native-auth/google")
class NativeGoogleResource {
    @Resource("exchange") class Exchange(val parent: NativeGoogleResource = NativeGoogleResource())
}

@Resource("/native-auth/reset")
class NativeResetResource {
    @Resource("complete") class Complete(val parent: NativeResetResource = NativeResetResource())
}

enum class BrowserFlowKind(val wire: String) {
    Google("google"),
    Reset("reset"),
}

data class NativeHandoff(val flowId: String, val code: String)

data class NativeCallback(val kind: BrowserFlowKind, val handoff: NativeHandoff)

interface BrowserAuthRepository {
    suspend fun startGoogle(): String

    suspend fun acceptsCallback(callback: NativeCallback): Boolean

    suspend fun finishGoogle(handoff: NativeHandoff): AuthUser

    suspend fun requestResetLink(email: String)

    suspend fun completeReset(handoff: NativeHandoff, password: String)
}

/**
 * Browser URLs carry no cookies/reset tokens. Only this app's encrypted verifier can redeem a code.
 */
class KtorBrowserAuthRepository(
    private val client: HttpClient,
    private val cookies: PersistentCookies,
    private val auth: AuthRepository,
    private val baseUrl: String,
) : BrowserAuthRepository {
    @Serializable private data class Start(val challenge: String)

    @Serializable private data class StartReset(val challenge: String, val email: String)

    @Serializable
    private data class Flow(val flowId: String, val expiresIn: Int, val browserUrl: String? = null)

    @Serializable
    private data class Redeem(val flowId: String, val code: String, val verifier: String)

    @Serializable
    private data class Reset(
        val flowId: String,
        val code: String,
        val verifier: String,
        val newPassword: String,
    )

    @Serializable private data class Result(val success: Boolean)

    private data class Pending(val flowId: String, val verifier: String)

    private val vaultUrl = Url(baseUrl.trimEnd('/') + "/__native")

    private fun name(kind: BrowserFlowKind) = "guallet.native_${kind.wire}"

    private fun freshVerifier(): String =
        Base64.getUrlEncoder()
            .withoutPadding()
            .encodeToString(ByteArray(32).also { SecureRandom().nextBytes(it) })

    private fun challenge(verifier: String): String =
        Base64.getUrlEncoder()
            .withoutPadding()
            .encodeToString(
                MessageDigest.getInstance("SHA-256").digest(verifier.toByteArray(Charsets.US_ASCII))
            )

    private fun invalid(): Nothing =
        throw UiMessageException(
            uiMessage(R.string.message_this_sign_in_attempt_has_expired_please_try_again)
        )

    private suspend fun retain(kind: BrowserFlowKind, flow: Flow, verifier: String) {
        if (!Regex("[A-Za-z0-9_-]{43}").matches(flow.flowId) || flow.expiresIn !in 1..600) invalid()
        cookies.addCookie(
            vaultUrl,
            Cookie(
                name(kind),
                "${flow.flowId}.$verifier",
                maxAge = flow.expiresIn,
                path = "/__native",
                secure = true,
                httpOnly = true,
            ),
        )
    }

    private suspend fun pending(kind: BrowserFlowKind): Pending? {
        val parts =
            cookies.get(vaultUrl).firstOrNull { it.name == name(kind) }?.value?.split('.')
                ?: return null
        if (parts.size != 2 || parts.any { !Regex("[A-Za-z0-9_-]{43}").matches(it) }) return null
        return Pending(parts[0], parts[1])
    }

    private suspend fun forget(kind: BrowserFlowKind) {
        cookies.addCookie(
            vaultUrl,
            Cookie(name(kind), "", maxAge = 0, path = "/__native", secure = true, httpOnly = true),
        )
    }

    override suspend fun startGoogle(): String {
        val verifier = freshVerifier()
        val flow =
            client.post(NativeGoogleResource()) { setBody(Start(challenge(verifier))) }.body<Flow>()
        val target = flow.browserUrl?.let(::Url) ?: invalid()
        val origin = Url(baseUrl)
        if (
            target.protocol.name != "https" ||
                target.host != origin.host ||
                target.port != origin.port ||
                !target.user.isNullOrEmpty() ||
                !target.password.isNullOrEmpty() ||
                target.fragment.isNotEmpty() ||
                target.encodedPath != "/native-auth/google/start" ||
                target.parameters.names() != setOf("flowId") ||
                target.parameters.getAll("flowId")?.size != 1 ||
                target.parameters["flowId"] != flow.flowId
        )
            invalid()
        retain(BrowserFlowKind.Google, flow, verifier)
        return target.toString()
    }

    override suspend fun acceptsCallback(callback: NativeCallback): Boolean =
        pending(callback.kind)?.flowId == callback.handoff.flowId

    override suspend fun finishGoogle(handoff: NativeHandoff): AuthUser {
        val local =
            pending(BrowserFlowKind.Google)?.takeIf { it.flowId == handoff.flowId } ?: invalid()
        val result =
            client
                .post(NativeGoogleResource.Exchange()) {
                    setBody(Redeem(handoff.flowId, handoff.code, local.verifier))
                }
                .body<Result>()
        if (!result.success) invalid()
        forget(BrowserFlowKind.Google)
        return auth.session()
            ?: throw UiMessageException(
                uiMessage(R.string.message_could_not_verify_the_returned_session)
            )
    }

    override suspend fun requestResetLink(email: String) {
        val verifier = freshVerifier()
        val flow =
            client
                .post(NativeResetResource()) { setBody(StartReset(challenge(verifier), email)) }
                .body<Flow>()
        retain(BrowserFlowKind.Reset, flow, verifier)
    }

    override suspend fun completeReset(handoff: NativeHandoff, password: String) {
        val local =
            pending(BrowserFlowKind.Reset)?.takeIf { it.flowId == handoff.flowId } ?: invalid()
        val result =
            client
                .post(NativeResetResource.Complete()) {
                    setBody(Reset(handoff.flowId, handoff.code, local.verifier, password))
                }
                .body<Result>()
        if (!result.success) invalid()
        cookies.clear()
    }
}

/** Reject legacy credential-bearing callbacks, fragments, extra fields and ambiguous parameters. */
fun parseNativeCallback(value: String): NativeCallback? =
    runCatching {
            require(value.length <= 1024)
            val uri = URI(value)
            require(
                uri.scheme == "guallet-android" &&
                    uri.host == "login" &&
                    uri.port == -1 &&
                    uri.userInfo == null &&
                    uri.fragment == null
            )
            val kind =
                when (uri.path) {
                    "/callback" -> BrowserFlowKind.Google
                    "/reset-password" -> BrowserFlowKind.Reset
                    else -> error("Unknown callback")
                }
            val pairs =
                uri.rawQuery.orEmpty().split('&').map { part ->
                    val bits = part.split('=', limit = 2)
                    require(bits.size == 2)
                    URLDecoder.decode(bits[0], "UTF-8") to URLDecoder.decode(bits[1], "UTF-8")
                }
            require(pairs.size == 2 && pairs.map { it.first }.toSet() == setOf("flow", "code"))
            val values = pairs.toMap()
            require(values.values.all { Regex("[A-Za-z0-9_-]{43}").matches(it) })
            NativeCallback(kind, NativeHandoff(values.getValue("flow"), values.getValue("code")))
        }
        .getOrNull()
