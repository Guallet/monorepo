@file:kotlinx.serialization.UseSerializers(io.guallet.android.core.network.DecimalSerializer::class)

package io.guallet.android.features.transactions.domain

import java.math.BigDecimal
import kotlinx.serialization.Serializable

@Serializable
data class Transaction(
    val id: String,
    val accountId: String,
    val description: String,
    val amount: BigDecimal,
    val currency: String,
    val date: String,
    val notes: String? = null,
    val categoryId: String? = null,
)

@Serializable
data class TransactionPage(val meta: PageMetadata, val transactions: List<Transaction>)

@Serializable
data class PageMetadata(val total: Int, val page: Int, val pageSize: Int, val hasMore: Boolean)

@Serializable
data class TransactionInput(
    val accountId: String,
    val description: String,
    val amount: BigDecimal,
    val currency: String,
    val date: String,
    val notes: String? = null,
    val categoryId: String? = null,
)
