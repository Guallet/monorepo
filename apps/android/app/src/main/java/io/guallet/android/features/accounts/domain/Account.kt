package io.guallet.android.features.accounts.domain

import io.guallet.android.core.network.DecimalSerializer
import java.math.BigDecimal
import kotlinx.serialization.Serializable

@Serializable
data class AccountBalance(
    @Serializable(with = DecimalSerializer::class) val amount: BigDecimal,
    val currency: String,
)

@Serializable
data class Account(
    val id: String,
    val name: String,
    val currency: String,
    val type: String,
    val balance: AccountBalance? = null,
    val institutionId: String? = null,
    val source: String? = null,
    val sourceName: String? = null,
) {
    val accountType
        get() = AccountType.entries.find { it.wire == type } ?: AccountType.Unknown

    val isSynced
        get() = source == "synced"
}

enum class AccountType(val wire: String, val label: String) {
    Current("current-account", "Current account"),
    CreditCard("credit-card", "Credit card"),
    Savings("savings-account", "Savings"),
    Investment("investment", "Investment"),
    Mortgage("mortgage", "Mortgage"),
    Loan("loan", "Loan"),
    Pension("pension", "Pension"),
    Unknown("unknown", "Other"),
}

@Serializable
data class AccountTransaction(
    val id: String,
    val description: String,
    @Serializable(with = DecimalSerializer::class) val amount: BigDecimal,
    val currency: String,
    val date: String,
)
