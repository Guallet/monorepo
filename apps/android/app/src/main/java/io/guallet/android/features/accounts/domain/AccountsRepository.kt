package io.guallet.android.features.accounts.domain

import java.math.BigDecimal

/** All calls use the shared session-authenticated HTTP client. No on-disk finance cache. */
interface AccountsRepository {
    suspend fun list(): List<Account>

    suspend fun get(id: String): Account

    suspend fun transactions(id: String): List<AccountTransaction>

    suspend fun create(input: AccountInput): Account

    suspend fun update(id: String, input: AccountInput): Account

    suspend fun delete(id: String)
}

data class AccountInput(
    val name: String,
    val type: String,
    val currency: String,
    val balance: BigDecimal,
    val recordBalanceTransaction: Boolean = true,
)
