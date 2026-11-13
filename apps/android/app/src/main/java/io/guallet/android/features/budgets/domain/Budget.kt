@file:kotlinx.serialization.UseSerializers(io.guallet.android.core.network.DecimalSerializer::class)

package io.guallet.android.features.budgets.domain

import java.math.BigDecimal
import kotlinx.serialization.Serializable

@Serializable
data class Budget(
    val id: String,
    val name: String,
    val amount: BigDecimal,
    val currency: String,
    val spent: BigDecimal,
    val categories: List<String> = emptyList(),
    val colour: String? = null,
    val icon: String? = null,
)

@Serializable
data class BudgetInput(
    val name: String,
    val amount: BigDecimal,
    val currency: String,
    val categories: List<String>,
    val colour: String = "#005EB8",
    val icon: String = "IconPigMoney",
)
