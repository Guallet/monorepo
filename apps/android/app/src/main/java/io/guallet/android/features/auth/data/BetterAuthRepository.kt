package io.guallet.android.features.auth.data

import io.guallet.android.core.network.PersistentCookies
import io.guallet.android.features.auth.domain.AuthRepository
import io.guallet.android.features.auth.domain.AuthUser
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.ClientRequestException
import io.ktor.client.plugins.resources.get
import io.ktor.client.plugins.resources.post
import io.ktor.client.request.setBody
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.Serializable

class BetterAuthRepository(private val client: HttpClient, private val cookies: PersistentCookies) :
    AuthRepository {
    @Serializable private data class UserResponse(val user: AuthUser)

    @Serializable
    private data class Credentials(
        val email: String,
        val password: String,
        val rememberMe: Boolean = true,
    )

    @Serializable
    private data class Registration(val name: String, val email: String, val password: String)

    @Serializable private data class Email(val email: String)

    @Serializable private data class SendCode(val email: String, val type: String = "sign-in")

    @Serializable private data class Code(val email: String, val otp: String)

    @Serializable private data class Reset(val email: String, val otp: String, val password: String)

    override suspend fun session(): AuthUser? =
        try {
            val user = client.get(Auth.Session()).body<UserResponse?>()?.user
            if (user == null) cookies.clearSession()
            user
        } catch (error: ClientRequestException) {
            if (error.response.status != HttpStatusCode.Unauthorized) throw error
            cookies.clearSession()
            null
        }

    override suspend fun signIn(email: String, password: String): AuthUser =
        client
            .post(Auth.SignIn()) { setBody(Credentials(email, password)) }
            .body<UserResponse>()
            .user

    override suspend fun signUp(name: String, email: String, password: String): AuthUser =
        client
            .post(Auth.SignUp()) { setBody(Registration(name, email, password)) }
            .body<UserResponse>()
            .user

    override suspend fun sendCode(email: String) {
        client.post(Auth.SendCode()) { setBody(SendCode(email)) }
    }

    override suspend fun verifyCode(email: String, code: String): AuthUser =
        client.post(Auth.VerifyCode()) { setBody(Code(email, code)) }.body<UserResponse>().user

    override suspend fun requestReset(email: String) {
        client.post(Auth.RequestReset()) { setBody(Email(email)) }
    }

    override suspend fun resetPassword(email: String, code: String, password: String) {
        client.post(Auth.ResetPassword()) { setBody(Reset(email, code, password)) }
        cookies.clear()
    }

    override suspend fun signOut() {
        // Keep the session when revocation fails, so the user can retry.
        client.post(Auth.SignOut()) { setBody(emptyMap<String, String>()) }
        cookies.clear()
    }
}
