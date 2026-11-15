package io.guallet.android

import io.guallet.android.features.auth.domain.AuthRepository
import io.guallet.android.features.auth.domain.AuthUser
import io.guallet.android.features.auth.presentation.AuthViewModel
import io.guallet.android.features.auth.presentation.SessionState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class AuthViewModelTest {
    private val dispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(dispatcher)
    }

    @After
    fun cleanup() {
        Dispatchers.resetMain()
    }

    @Test
    fun `startup outage offers retry instead of silently logging out`() =
        runTest(dispatcher) {
            val repository = FakeAuthRepository().apply { offline = true }
            val model = AuthViewModel(repository)
            advanceUntilIdle()
            assertEquals(SessionState.Unavailable, model.state.value.session)
            repository.offline = false
            model.restoreSession()
            advanceUntilIdle()
            assertEquals(SessionState.SignedOut, model.state.value.session)
        }

    @Test
    fun `invalid input does not call API and duplicate submissions are ignored`() =
        runTest(dispatcher) {
            val repository = FakeAuthRepository()
            val model = AuthViewModel(repository)
            advanceUntilIdle()
            model.signIn("invalid", "password")
            advanceUntilIdle()
            assertEquals(0, repository.calls)
            assertNotNull(model.state.value.error)
            model.signIn("alex@example.test", "password")
            model.signIn("alex@example.test", "password")
            advanceUntilIdle()
            assertEquals(1, repository.calls)
            assertTrue(model.state.value.session is SessionState.SignedIn)
            assertFalse(model.state.value.busy)
            model.signOut()
            advanceUntilIdle()
            assertEquals(SessionState.SignedOut, model.state.value.session)
        }
}

private class FakeAuthRepository : AuthRepository {
    var calls = 0
    var offline = false
    private val user = AuthUser("1", "Alex", "alex@example.test")

    override suspend fun session(): AuthUser? {
        if (offline) error("offline")
        return null
    }

    override suspend fun signIn(email: String, password: String): AuthUser {
        calls++
        return user
    }

    override suspend fun signUp(name: String, email: String, password: String) = user

    override suspend fun sendCode(email: String) = Unit

    override suspend fun verifyCode(email: String, code: String) = user

    override suspend fun requestReset(email: String) = Unit

    override suspend fun resetPassword(email: String, code: String, password: String) = Unit

    override suspend fun signOut() = Unit
}
