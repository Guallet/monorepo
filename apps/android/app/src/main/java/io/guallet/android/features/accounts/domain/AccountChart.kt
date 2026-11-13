@file:kotlinx.serialization.UseSerializers(io.guallet.android.core.network.DecimalSerializer::class)

package io.guallet.android.features.accounts.domain

import java.math.BigDecimal
import kotlinx.serialization.Serializable

@Serializable data class BalancePoint(val date: String, val balance: BigDecimal)

@Serializable data class AccountChart(val balanceHistory: List<BalancePoint>)
