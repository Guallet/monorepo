package io.guallet.android.core.network

import io.guallet.android.core.security.CookieStore
import io.ktor.client.plugins.cookies.CookiesStorage
import io.ktor.http.Cookie
import io.ktor.http.Url
import io.ktor.http.parseServerSetCookieHeader
import io.ktor.http.renderSetCookieHeader
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import okhttp3.Cookie as OkCookie
import okhttp3.HttpUrl.Companion.toHttpUrl

/** OkHttp supplies RFC cookie domain/path/expiry matching; Ktor owns HTTP cookies. */
class PersistentCookies(
    private val store: CookieStore,
    baseUrl: String,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
) : CookiesStorage {
    private val origin = baseUrl.toHttpUrl()
    private val mutex = Mutex()
    private var cookies = emptyList<StoredCookie>()
    private var loaded = false

    private suspend fun load() {
        if (loaded) return
        cookies =
            withContext(ioDispatcher) {
                store
                    .read()
                    ?.let {
                        runCatching { apiJson.decodeFromString<List<StoredCookie>>(it) }.getOrNull()
                    }
                    .orEmpty()
            }
        loaded = true
    }

    private suspend fun persist(next: List<StoredCookie>) {
        withContext(ioDispatcher) {
            store.write(apiJson.encodeToString(next))
            // Publish in the same non-suspending block: cancellation after commit must
            // not leave this process using credentials different from those on disk.
            cookies = next
        }
    }

    @Serializable private data class StoredCookie(val value: String, val hostOnly: Boolean)

    private fun parse(stored: StoredCookie): OkCookie? {
        val parsed = OkCookie.parse(origin, stored.value) ?: return null
        return if (stored.hostOnly) parsed.newBuilder().hostOnlyDomain(parsed.domain).build()
        else parsed
    }

    override suspend fun get(requestUrl: Url): List<Cookie> =
        mutex.withLock {
            val url = requestUrl.toString().toHttpUrl()
            if (url.scheme != origin.scheme || url.host != origin.host || url.port != origin.port) {
                return@withLock emptyList()
            }
            load()
            cookies
                .mapNotNull(::parse)
                .filter { it.expiresAt > System.currentTimeMillis() && it.matches(url) }
                .map { parseServerSetCookieHeader(it.toString()) }
        }

    override suspend fun addCookie(requestUrl: Url, cookie: Cookie) =
        mutex.withLock {
            val url = requestUrl.toString().toHttpUrl()
            if (url.scheme != origin.scheme || url.host != origin.host || url.port != origin.port)
                return@withLock
            val parsed = OkCookie.parse(url, renderSetCookieHeader(cookie)) ?: return@withLock
            load()
            val next =
                cookies.filterNot {
                    val old = parse(it)
                    old == null ||
                        old.expiresAt <= System.currentTimeMillis() ||
                        (old.name == parsed.name &&
                            old.domain == parsed.domain &&
                            old.path == parsed.path)
                }
            if (parsed.expiresAt > System.currentTimeMillis()) {
                persist(next + StoredCookie(parsed.toString(), parsed.hostOnly))
            } else persist(next)
        }

    /** Session restoration must not discard an in-flight browser login nonce. */
    suspend fun clearSession() =
        mutex.withLock {
            load()
            val next =
                cookies.filterNot { stored ->
                    val name =
                        parse(stored)?.name?.removePrefix("__Secure-")?.removePrefix("__Host-")
                    name == "better-auth.session_token" || name == "better-auth.session_data"
                }
            persist(next)
        }

    suspend fun clear() =
        mutex.withLock {
            persist(emptyList())
            loaded = true
        }

    override fun close() = Unit
}
