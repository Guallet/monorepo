@file:kotlinx.serialization.UseSerializers(io.guallet.android.core.network.DecimalSerializer::class)

package io.guallet.android.features.recurring.domain

import java.math.BigDecimal
import kotlinx.serialization.Serializable

@Serializable
data class RecurringPayment(
    val id: String,
    val name: String,
    val amount: BigDecimal,
    val currency: String,
    val cadence: String,
    val type: String,
    val startDate: String? = null,
    val categoryId: String? = null,
    val imageUrl: String? = null,
)

@Serializable
data class RecurringInput(
    val name: String,
    val amount: BigDecimal,
    val currency: String,
    val cadence: String,
    val type: String,
    val startDate: String? = null,
    val categoryId: String? = null,
    val imageUrl: String? = null,
)
