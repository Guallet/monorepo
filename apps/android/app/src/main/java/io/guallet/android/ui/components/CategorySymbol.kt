package io.guallet.android.ui.components

import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource

@Composable
fun CategorySymbol(name: String?, colour: String? = null) {
    val tint =
        colour
            ?.takeIf { Regex("#[0-9a-fA-F]{6}").matches(it) }
            ?.drop(1)
            ?.toLong(16)
            ?.let { Color(0xFF000000 or it) }
    Icon(
        painterResource(categoryIcons[name] ?: categoryIcons.getValue("IconQuestionMark")),
        contentDescription = null,
        tint = tint ?: androidx.compose.material3.MaterialTheme.colorScheme.onSurface,
    )
}

@Composable
fun IconChoiceField(value: String, enabled: Boolean, onSelect: (String) -> Unit) {
    CategorySymbol(value)
    val choices =
        (selectableCategoryIcons + value).distinct().map {
            it to it.removePrefix("Icon").replace(Regex("([a-z])([A-Z])"), "$1 $2")
        }
    ChoiceField("Icon", value, choices, enabled, onSelect)
}
