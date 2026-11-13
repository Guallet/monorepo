package io.guallet.android.features.settings.domain

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class UserProfile(val name: String, val email: String, val profile_src: String? = null)

@Serializable
data class CurrencyPreferences(
    @SerialName("default_currency") val defaultCurrency: String? = null,
    @SerialName("preferred_currencies") val preferredCurrencies: List<String> = emptyList(),
)

@Serializable
data class UserSettings(
    val currencies: CurrencyPreferences,
    @SerialName("date_format") val dateFormat: String? = null,
)
