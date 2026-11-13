package io.guallet.android.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import io.guallet.android.R

/** Native mapping of DESIGN.MD and packages/guallet-theme tokens. */
object GualletTokens {
    val minimumTouchTarget = 48.dp
    val chartHeight = 180.dp
    val selectionHeight = 320.dp
    val support = Color(0xFF009639)
    val small = 8.dp
    val gutter = 16.dp
    val large = 24.dp
    val cardRadius = 16.dp
    val cardElevation = 2.dp
    val borderWidth = 1.dp
    val contentWidth = 480.dp
    val primary = Color(0xFF005EB8)
    val secondary = Color(0xFF41B6E6)
    val page = Color(0xFFF7FAFC)
    val text = Color(0xFF231F20)
    val muted = Color(0xFF425563)
    val border = Color(0xFFE5E7EB)
    val error = Color(0xFFDA291C)
}

@Composable
fun GualletTheme(content: @Composable () -> Unit) {
    val font = FontFamily(Font(R.font.inter))
    val defaults = Typography()
    MaterialTheme(
        colorScheme =
            lightColorScheme(
                primary = GualletTokens.primary,
                secondary = GualletTokens.secondary,
                background = GualletTokens.page,
                surface = Color.White,
                onSurface = GualletTokens.text,
                onSurfaceVariant = GualletTokens.muted,
                outline = GualletTokens.border,
                error = GualletTokens.error,
            ),
        typography =
            Typography(
                displayLarge = defaults.displayLarge.copy(fontFamily = font),
                displayMedium = defaults.displayMedium.copy(fontFamily = font),
                displaySmall = defaults.displaySmall.copy(fontFamily = font),
                headlineSmall = defaults.headlineSmall.copy(fontFamily = font),
                titleMedium = defaults.titleMedium.copy(fontFamily = font),
                titleSmall = defaults.titleSmall.copy(fontFamily = font),
                bodySmall = defaults.bodySmall.copy(fontFamily = font),
                labelMedium = defaults.labelMedium.copy(fontFamily = font),
                labelSmall = defaults.labelSmall.copy(fontFamily = font),
                headlineLarge = defaults.headlineLarge.copy(fontFamily = font),
                headlineMedium = defaults.headlineMedium.copy(fontFamily = font),
                titleLarge = defaults.titleLarge.copy(fontFamily = font),
                bodyLarge = defaults.bodyLarge.copy(fontFamily = font),
                bodyMedium = defaults.bodyMedium.copy(fontFamily = font),
                labelLarge = defaults.labelLarge.copy(fontFamily = font),
            ),
        content = content,
    )
}
