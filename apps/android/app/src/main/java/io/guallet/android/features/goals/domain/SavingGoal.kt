@file:kotlinx.serialization.UseSerializers(io.guallet.android.core.network.DecimalSerializer::class)

package io.guallet.android.features.goals.domain

import java.math.BigDecimal
import kotlinx.serialization.Serializable

@Serializable
data class SavingGoal(
    val id: String,
    val name: String,
    val targetAmount: BigDecimal,
    val accounts: List<String>,
    val currentAmount: BigDecimal,
    val progressPercentage: Double,
    val isCompleted: Boolean,
    val isOverdue: Boolean,
    val remainingAmount: BigDecimal,
    val daysRemaining: Int? = null,
    val description: String? = null,
    val targetDate: String? = null,
    val priority: Int? = null,
)

@Serializable
data class GoalInput(
    val name: String,
    val targetAmount: BigDecimal,
    val accounts: List<String>,
    val description: String? = null,
    val targetDate: String? = null,
    val priority: Int = 0,
)
