package io.guallet.android.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.remember
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel

/** Destination-owned financial state; no SavedStateHandle or Bundle persistence. */
class MemoryDraftViewModel : ViewModel() {
    private data class Field(val inputs: List<Any?>, val value: MutableState<*>)

    private val fields = mutableMapOf<String, Field>()

    @Suppress("UNCHECKED_CAST")
    fun <T> field(
        key: String,
        inputs: List<Any?>,
        initial: () -> MutableState<T>,
    ): MutableState<T> {
        val existing = fields[key]
        if (existing == null || existing.inputs != inputs) fields[key] = Field(inputs, initial())
        return fields.getValue(key).value as MutableState<T>
    }

    fun clearPrefix(prefix: String) {
        fields.keys.removeAll { it.startsWith(prefix) }
    }

    override fun onCleared() {
        fields.clear()
    }
}

/** Explicit keys prevent fields of different types from sharing a cached state. */
@Composable
fun <T> rememberMemoryDraft(
    key: String,
    vararg inputs: Any?,
    initial: () -> MutableState<T>,
): MutableState<T> {
    val drafts: MemoryDraftViewModel = viewModel()
    return remember(drafts, key, *inputs) { drafts.field(key, inputs.toList(), initial) }
}
