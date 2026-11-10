package io.guallet.android.core.network

import io.guallet.android.core.security.CookieStore
import io.ktor.client.plugins.cookies.CookiesStorage
import io.ktor.http.Cookie
import io.ktor.http.Url
import io.ktor.http.parseServerSetCookieHeader
import io.ktor.http.renderSetCookieHeader
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import okhttp3.Cookie as OkCookie
import okhttp3.HttpUrl.Companion.toHttpUrl

/** OkHttp supplies RFC cookie domain/path/expiry matching; Ktor owns HTTP cookies. */
class PersistentCookies(private val store: CookieStore, baseUrl: String) : CookiesStorage {
    private val origin = baseUrl.toHttpUrl()
    private val mutex = Mutex()
    private var cookies =
        store
            .read()
            ?.let { runCatching { apiJson.decodeFromString<List<StoredCookie>>(it) }.getOrNull() }
            .orEmpty()
            .toMutableList()

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
            cookies.removeAll {
                val old = parse(it)
                old == null ||
                    old.expiresAt <= System.currentTimeMillis() ||
                    (old.name == parsed.name &&
                        old.domain == parsed.domain &&
                        old.path == parsed.path)
            }
            if (parsed.expiresAt > System.currentTimeMillis()) {
                cookies.add(StoredCookie(parsed.toString(), parsed.hostOnly))
            }
            store.write(apiJson.encodeToString(cookies))
        }

    suspend fun clear() =
        mutex.withLock {
            cookies.clear()
            store.write("[]")
        }

    override fun close() = Unit
}
