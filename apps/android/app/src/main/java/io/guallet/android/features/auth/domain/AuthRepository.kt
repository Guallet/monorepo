package io.guallet.android.features.auth.domain

import kotlinx.serialization.Serializable

@Serializable data class AuthUser(val id: String, val name: String, val email: String)

interface AuthRepository {
    suspend fun session(): AuthUser?

    suspend fun signIn(email: String, password: String): AuthUser

    suspend fun signUp(name: String, email: String, password: String): AuthUser

    suspend fun sendCode(email: String)

    suspend fun verifyCode(email: String, code: String): AuthUser

    suspend fun requestReset(email: String)

    suspend fun resetPassword(email: String, code: String, password: String)

    suspend fun signOut()
}
