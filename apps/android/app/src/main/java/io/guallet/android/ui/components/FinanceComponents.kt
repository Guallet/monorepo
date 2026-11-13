package io.guallet.android.ui.components

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.KeyboardType
import io.guallet.android.core.state.ResourceState
import io.guallet.android.features.finance.presentation.MutationState
import io.guallet.android.ui.theme.GualletTokens as Tokens

@Composable
fun FinancePage(
    title: String,
    onBack: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    Column(
        Modifier.fillMaxSize()
            .safeDrawingPadding()
            .imePadding()
            .verticalScroll(rememberScrollState())
            .padding(Tokens.gutter),
        verticalArrangement = Arrangement.spacedBy(Tokens.gutter),
    ) {
        if (onBack != null) TextButton(onClick = onBack) { Text("Back") }
        Text(title, style = MaterialTheme.typography.headlineMedium)
        content()
    }
}

@Composable
fun FinanceCard(content: @Composable ColumnScope.() -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(Tokens.cardRadius),
        border = BorderStroke(Tokens.borderWidth, Tokens.border),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = Tokens.cardElevation),
    ) {
        Column(
            Modifier.fillMaxWidth().padding(Tokens.gutter),
            verticalArrangement = Arrangement.spacedBy(Tokens.small),
            content = content,
        )
    }
}

@Composable
fun ErrorNotice(message: String, retry: (() -> Unit)? = null) {
    Text(
        message,
        color = MaterialTheme.colorScheme.error,
        modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
    )
    if (retry != null) OutlinedButton(onClick = retry) { Text("Try again") }
}

@Composable
fun <T> RemoteContent(
    state: ResourceState<T>,
    retry: () -> Unit,
    content: @Composable (T) -> Unit,
) {
    if (state.loading) LinearProgressIndicator(Modifier.fillMaxWidth())
    state.error?.let { ErrorNotice(it, retry) }
    state.value?.let { content(it) }
}

@Composable
fun MutationFeedback(state: MutationState) {
    if (state.busy) LinearProgressIndicator(Modifier.fillMaxWidth())
    state.error?.let { ErrorNotice(it) }
}

@Composable
fun TextField(
    label: String,
    value: String,
    enabled: Boolean = true,
    keyboard: KeyboardType = KeyboardType.Text,
    multiline: Boolean = false,
    onChange: (String) -> Unit,
) {
    OutlinedTextField(
        value,
        onChange,
        label = { Text(label) },
        enabled = enabled,
        singleLine = !multiline,
        minLines = if (multiline) 3 else 1,
        keyboardOptions = KeyboardOptions(keyboardType = keyboard),
        modifier = Modifier.fillMaxWidth(),
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChoiceField(
    label: String,
    selected: String?,
    options: List<Pair<String, String>>,
    enabled: Boolean = true,
    onSelect: (String) -> Unit,
) {
    var open by remember { mutableStateOf(false) }
    var query by remember { mutableStateOf("") }
    OutlinedButton(
        onClick = {
            open = true
            query = ""
        },
        enabled = enabled,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Text("$label: ${options.find { it.first == selected }?.second ?: "Choose"}")
    }
    if (open)
        ModalBottomSheet(onDismissRequest = { open = false }) {
            Column(
                Modifier.fillMaxWidth().padding(Tokens.gutter),
                verticalArrangement = Arrangement.spacedBy(Tokens.small),
            ) {
                Text(label, style = MaterialTheme.typography.titleLarge)
                TextField("Search", query, onChange = { query = it })
                androidx.compose.foundation.lazy.LazyColumn(
                    Modifier.heightIn(max = Tokens.selectionHeight)
                ) {
                    options
                        .filter { it.second.contains(query, ignoreCase = true) }
                        .forEach { (value, text) ->
                            item(key = value) {
                                Row(
                                    Modifier.fillMaxWidth()
                                        .clickable {
                                            onSelect(value)
                                            open = false
                                        }
                                        .padding(Tokens.small)
                                ) {
                                    RadioButton(
                                        selected == value,
                                        onClick = {
                                            onSelect(value)
                                            open = false
                                        },
                                    )
                                    Text(text, Modifier.padding(Tokens.small))
                                }
                            }
                        }
                }
                TextButton(onClick = { open = false }) { Text("Close") }
            }
        }
}

@Composable
fun MultiChoice(
    label: String,
    selected: Set<String>,
    options: List<Pair<String, String>>,
    enabled: Boolean = true,
    onChange: (Set<String>) -> Unit,
) {
    Text(label, style = MaterialTheme.typography.titleLarge)
    options.forEach { (id, text) ->
        Row(Modifier.fillMaxWidth()) {
            Checkbox(
                id in selected,
                enabled = enabled,
                onCheckedChange = { checked ->
                    onChange(if (checked) selected + id else selected - id)
                },
            )
            Text(text, Modifier.padding(Tokens.small))
        }
    }
}

@Composable
fun ConfirmDelete(title: String, busy: Boolean, onDismiss: () -> Unit, onDelete: () -> Unit) {
    AlertDialog(
        onDismissRequest = { if (!busy) onDismiss() },
        title = { Text(title) },
        text = { Text("This cannot be undone.") },
        confirmButton = {
            TextButton(enabled = !busy, onClick = onDelete) {
                Text("Delete", color = MaterialTheme.colorScheme.error)
            }
        },
        dismissButton = { TextButton(enabled = !busy, onClick = onDismiss) { Text("Cancel") } },
    )
}

/** Hold a dirty form until the user explicitly saves or discards it. */
@Composable
fun rememberFormBackHandler(dirty: Boolean, busy: Boolean, onBack: () -> Unit): () -> Unit {
    var confirm by remember { mutableStateOf(false) }
    val back = {
        if (!busy) {
            if (dirty) confirm = true else onBack()
        }
    }
    BackHandler(enabled = true) { back() }
    if (confirm)
        AlertDialog(
            onDismissRequest = { confirm = false },
            title = { Text("Discard changes?") },
            text = { Text("Your changes have not been saved.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        confirm = false
                        onBack()
                    }
                ) {
                    Text("Discard")
                }
            },
            dismissButton = { TextButton(onClick = { confirm = false }) { Text("Keep editing") } },
        )
    return back
}
