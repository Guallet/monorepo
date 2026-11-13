package io.guallet.android.core.state

import android.content.res.Resources
import androidx.annotation.PluralsRes
import androidx.annotation.StringRes

/** Resolve at the UI boundary so a locale change also updates existing feedback. */
sealed interface UiMessage {
    data class Resource(
        @field:StringRes @param:StringRes val id: Int,
        val arguments: List<Any> = emptyList(),
    ) : UiMessage

    data class Plural(
        @field:PluralsRes @param:PluralsRes val id: Int,
        val count: Int,
        val arguments: List<Any>,
    ) : UiMessage

    /** Already-localized validation or server-owned content. */
    data class Text(val value: String) : UiMessage

    fun resolve(resources: Resources): String =
        when (this) {
            is Resource ->
                if (arguments.isEmpty()) resources.getString(id)
                else resources.getString(id, *arguments.toTypedArray())
            is Plural -> resources.getQuantityString(id, count, *arguments.toTypedArray())
            is Text -> value
        }
}

fun uiMessage(@StringRes id: Int, vararg arguments: Any): UiMessage =
    UiMessage.Resource(id, arguments.toList())

class UiMessageException(val text: UiMessage) : IllegalArgumentException()

fun Exception.userMessage(resources: Resources): String? =
    if (this is UiMessageException) text.resolve(resources) else message

fun uiPlural(@PluralsRes id: Int, count: Int, vararg arguments: Any): UiMessage =
    UiMessage.Plural(id, count, arguments.toList())
