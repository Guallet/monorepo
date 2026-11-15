package io.guallet.android.features.accounts.data

import io.guallet.android.core.network.DecimalSerializer
import io.guallet.android.features.accounts.domain.*
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.resources.*
import io.ktor.client.request.setBody
import java.math.BigDecimal
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

class KtorAccountsRepository(private val client: HttpClient) : AccountsRepository {
    @Serializable
    private data class CreateRequest(
        val name: String,
        val type: String,
        val currency: String,
        @SerialName("initial_balance")
        @Serializable(with = DecimalSerializer::class)
        val balance: BigDecimal,
        @SerialName("create_balance_transaction") val recordBalanceTransaction: Boolean,
        val source: String = "manual",
    )

    @Serializable
    private data class UpdateRequest(
        val name: String,
        val type: String,
        val currency: String,
        @Serializable(with = DecimalSerializer::class) val balance: BigDecimal,
        @SerialName("create_balance_transaction") val recordBalanceTransaction: Boolean,
    )

    override suspend fun list(): List<Account> = client.get(Accounts()).body()

    override suspend fun get(id: String): Account = client.get(Accounts.Id(id = id)).body()

    override suspend fun transactions(id: String): List<AccountTransaction> =
        client.get(Accounts.Id.Transactions(Accounts.Id(id = id))).body()

    override suspend fun create(input: AccountInput): Account =
        client
            .post(Accounts()) {
                setBody(
                    CreateRequest(
                        input.name,
                        input.type,
                        input.currency,
                        input.balance,
                        input.recordBalanceTransaction,
                    )
                )
            }
            .body()

    override suspend fun update(id: String, input: AccountInput): Account =
        client
            .patch(Accounts.Id(id = id)) {
                setBody(
                    UpdateRequest(
                        input.name,
                        input.type,
                        input.currency,
                        input.balance,
                        input.recordBalanceTransaction,
                    )
                )
            }
            .body()

    override suspend fun delete(id: String) {
        client.delete(Accounts.Id(id = id))
    }
}
