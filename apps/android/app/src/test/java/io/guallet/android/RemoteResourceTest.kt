package io.guallet.android

import io.guallet.android.core.state.RemoteResource
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.NonCancellable
import kotlinx.coroutines.test.*
import kotlinx.coroutines.withContext
import org.junit.Assert.*
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class RemoteResourceTest {
    @Test
    fun `refresh retains matching data while a different account clears cached data`() = runTest {
        val resource = RemoteResource<String>(backgroundScope) {}
        resource.load("account-a") { "first history" }
        runCurrent()
        assertEquals("first history", resource.state.value.value)
        val refresh = CompletableDeferred<String>()
        resource.load("account-a") { refresh.await() }
        assertEquals("first history", resource.state.value.value)
        val next = CompletableDeferred<String>()
        resource.load("account-b") { next.await() }
        assertNull(resource.state.value.value)
        assertEquals("account-b", resource.state.value.requestKey)
        runCurrent()
        next.complete("second history")
        runCurrent()
        assertEquals("second history", resource.state.value.value)
        assertFalse(resource.state.value.loading)
    }

    @Test
    fun `cancelled non-cooperative requests cannot overwrite newer data or errors`() = runTest {
        for (fails in listOf(false, true)) {
            val resource = RemoteResource<String>(backgroundScope) {}
            val old = CompletableDeferred<String>()
            resource.load("old") { withContext(NonCancellable) { old.await() } }
            runCurrent()
            resource.load("new") { "current result" }
            runCurrent()
            if (fails) old.completeExceptionally(IllegalArgumentException("stale error"))
            else old.complete("stale result")
            runCurrent()
            assertEquals("current result", resource.state.value.value)
            assertEquals("new", resource.state.value.requestKey)
            assertNull(resource.state.value.error)
            assertFalse(resource.state.value.loading)
        }
    }
}
