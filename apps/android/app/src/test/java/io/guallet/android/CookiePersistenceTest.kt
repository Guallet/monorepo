package io.guallet.android

import io.guallet.android.core.network.PersistentCookies
import io.guallet.android.core.security.CookieStore
import io.ktor.http.Cookie
import io.ktor.http.Url
import java.io.IOException
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicReference
import kotlinx.coroutines.*
import org.junit.Assert.*
import org.junit.Test

class CookiePersistenceTest {
    private val origin = "https://api.example.test"
    private val url = Url(origin)

    private fun cookie(value: String) =
        Cookie("session", value, maxAge = 3600, path = "/", secure = true)

    @Test
    fun `construction is lazy and all persistence uses the IO dispatcher`() = runBlocking {
        val threads = mutableListOf<String>()
        val store =
            object : CookieStore {
                override fun read(): String? {
                    threads.add(Thread.currentThread().name)
                    return null
                }

                override fun write(value: String) {
                    threads.add(Thread.currentThread().name)
                }
            }
        Executors.newSingleThreadExecutor { Thread(it, "cookies-io") }
            .asCoroutineDispatcher()
            .use { io ->
                val cookies = PersistentCookies(store, origin, io)
                assertTrue(threads.isEmpty())
                cookies.get(url)
                cookies.addCookie(url, cookie("value"))
                assertEquals(2, threads.size)
                assertTrue(threads.all { it.startsWith("cookies-io") })
            }
    }

    @Test
    fun `failed persistence leaves memory and stored credentials unchanged`() = runBlocking {
        var saved: String? = null
        var reject = false
        val store =
            object : CookieStore {
                override fun read() = saved

                override fun write(value: String) {
                    if (reject) throw IOException("Cannot commit")
                    saved = value
                }
            }
        val cookies = PersistentCookies(store, origin)
        cookies.addCookie(url, cookie("original"))
        reject = true
        assertTrue(runCatching { cookies.addCookie(url, cookie("replacement")) }.isFailure)
        assertEquals("original", cookies.get(url).single().value)
        assertEquals("original", PersistentCookies(store, origin).get(url).single().value)
    }

    @Test
    fun `cancellation during a successful commit keeps memory consistent with disk`() =
        runBlocking {
            val entered = CountDownLatch(1)
            val finish = CountDownLatch(1)
            val saved = AtomicReference<String?>()
            val store =
                object : CookieStore {
                    override fun read() = saved.get()

                    override fun write(value: String) {
                        entered.countDown()
                        check(finish.await(5, TimeUnit.SECONDS))
                        saved.set(value)
                    }
                }
            Executors.newSingleThreadExecutor().asCoroutineDispatcher().use { io ->
                val cookies = PersistentCookies(store, origin, io)
                val write =
                    launch(Dispatchers.Default) { cookies.addCookie(url, cookie("committed")) }
                try {
                    assertTrue(withContext(Dispatchers.IO) { entered.await(5, TimeUnit.SECONDS) })
                    write.cancel()
                } finally {
                    finish.countDown()
                }
                write.join()
                assertEquals("committed", cookies.get(url).single().value)
                assertEquals(
                    "committed",
                    PersistentCookies(store, origin, io).get(url).single().value,
                )
            }
        }
}
