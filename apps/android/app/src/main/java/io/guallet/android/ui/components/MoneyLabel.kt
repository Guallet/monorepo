package io.guallet.android.ui.components

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.font.FontWeight
import io.guallet.android.R
import io.guallet.android.core.money.Money
import io.guallet.android.ui.theme.GualletTokens
import java.math.BigDecimal
import java.util.Locale

@Composable
fun MoneyLabel(amount: BigDecimal, currency: String, locale: Locale = Locale.getDefault()) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val text =
        runCatching { Money.fromCurrencyCode(amount, currency).format(locale, includeCode = true) }
            .getOrNull()
    Text(
        text ?: resources.getString(R.string.amount_unavailable_value, currency),
        color =
            when {
                text == null -> MaterialTheme.colorScheme.onSurfaceVariant
                amount.signum() < 0 -> MaterialTheme.colorScheme.error
                amount.signum() > 0 -> GualletTokens.support
                else -> MaterialTheme.colorScheme.onSurface
            },
        fontWeight = FontWeight.Bold,
        style = MaterialTheme.typography.bodyLarge.copy(fontFeatureSettings = "tnum"),
    )
}
