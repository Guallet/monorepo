package io.guallet.android.ui.components

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.KeyboardType
import io.guallet.android.R
import io.guallet.android.core.state.*
import io.guallet.android.features.finance.presentation.MutationState
import io.guallet.android.ui.theme.GualletTokens as Tokens

@Composable
fun FinancePage(
    title: String,
    onBack: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    Column(
        Modifier.fillMaxSize()
            .safeDrawingPadding()
            .imePadding()
            .verticalScroll(rememberScrollState())
            .padding(Tokens.gutter),
        verticalArrangement = Arrangement.spacedBy(Tokens.gutter),
    ) {
        if (onBack != null)
            TextButton(onClick = onBack) { Text(resources.getString(R.string.back)) }
        Text(title, style = MaterialTheme.typography.headlineMedium)
        content()
    }
}

/** A bounded viewport for collections; callers supply stable keys for domain rows. */
@Composable
fun FinanceListPage(
    title: String,
    onBack: (() -> Unit)? = null,
    content: LazyListScope.() -> Unit,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    LazyColumn(
        Modifier.fillMaxSize().safeDrawingPadding().imePadding(),
        contentPadding = PaddingValues(Tokens.gutter),
        verticalArrangement = Arrangement.spacedBy(Tokens.gutter),
    ) {
        item(key = "page-heading") {
            Column {
                if (onBack != null)
                    TextButton(onClick = onBack) { Text(resources.getString(R.string.back)) }
                Text(title, style = MaterialTheme.typography.headlineMedium)
            }
        }
        content()
    }
}

fun <T> LazyListScope.remoteItems(
    state: ResourceState<T>,
    retry: () -> Unit,
    prefix: String = "remote",
    content: LazyListScope.(T) -> Unit,
) {
    if (state.loading)
        item(key = "$prefix-loading") { LinearProgressIndicator(Modifier.fillMaxWidth()) }
    state.error?.let { message -> item(key = "$prefix-error") { ErrorNotice(message, retry) } }
    state.value?.let { content(it) }
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
    val resources = androidx.compose.ui.platform.LocalResources.current

    Text(
        message,
        color = MaterialTheme.colorScheme.error,
        modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
    )
    if (retry != null)
        OutlinedButton(onClick = retry) { Text(resources.getString(R.string.try_again)) }
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
    val resources = androidx.compose.ui.platform.LocalResources.current

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
        Text(
            resources.getString(
                R.string.label_value,
                label,
                options.find { it.first == selected }?.second
                    ?: resources.getString(R.string.choose),
            )
        )
    }
    if (open)
        ModalBottomSheet(onDismissRequest = { open = false }) {
            Column(
                Modifier.fillMaxWidth().padding(Tokens.gutter),
                verticalArrangement = Arrangement.spacedBy(Tokens.small),
            ) {
                Text(label, style = MaterialTheme.typography.titleLarge)
                TextField(resources.getString(R.string.search), query, onChange = { query = it })
                androidx.compose.foundation.lazy.LazyColumn(
                    Modifier.heightIn(max = Tokens.selectionHeight).selectableGroup()
                ) {
                    options
                        .filter { it.second.contains(query, ignoreCase = true) }
                        .forEach { (value, text) ->
                            item(key = value) {
                                Row(
                                    Modifier.fillMaxWidth()
                                        .heightIn(min = Tokens.minimumTouchTarget)
                                        .selectable(
                                            selected == value,
                                            enabled = enabled,
                                            role = Role.RadioButton,
                                        ) {
                                            onSelect(value)
                                            open = false
                                        }
                                        .padding(Tokens.small)
                                ) {
                                    RadioButton(
                                        selected == value,
                                        onClick = null,
                                        enabled = enabled,
                                    )
                                    Text(text, Modifier.padding(Tokens.small))
                                }
                            }
                        }
                }
                TextButton(onClick = { open = false }) { Text(resources.getString(R.string.close)) }
            }
        }
}

@Composable
fun LabelledCheckbox(
    label: String,
    checked: Boolean,
    enabled: Boolean = true,
    onChange: (Boolean) -> Unit,
) {
    Row(
        Modifier.fillMaxWidth()
            .heightIn(min = Tokens.minimumTouchTarget)
            .toggleable(checked, enabled = enabled, role = Role.Checkbox, onValueChange = onChange),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Checkbox(checked, onCheckedChange = null, enabled = enabled)
        Text(label, Modifier.weight(1f).padding(Tokens.small))
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MultiChoice(
    label: String,
    selected: Set<String>,
    options: List<Pair<String, String>>,
    enabled: Boolean = true,
    onChange: (Set<String>) -> Unit,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    Text(label, style = MaterialTheme.typography.titleLarge)
    fun change(id: String, checked: Boolean) =
        onChange(if (checked) selected + id else selected - id)
    if (options.size <= 8) {
        options.forEach { (id, text) ->
            key(id) { LabelledCheckbox(text, id in selected, enabled) { change(id, it) } }
        }
    } else {
        var open by remember { mutableStateOf(false) }
        var query by remember { mutableStateOf("") }
        OutlinedButton(
            enabled = enabled,
            onClick = {
                open = true
                query = ""
            },
        ) {
            Text(
                resources.getString(
                    R.string.label_value,
                    label,
                    resources.getQuantityString(
                        R.plurals.selected_count,
                        selected.size,
                        selected.size,
                    ),
                )
            )
        }
        if (open)
            ModalBottomSheet(onDismissRequest = { open = false }) {
                Column(Modifier.fillMaxWidth().padding(Tokens.gutter)) {
                    Text(label, style = MaterialTheme.typography.titleLarge)
                    TextField(
                        resources.getString(R.string.search),
                        query,
                        onChange = { query = it },
                    )
                    androidx.compose.foundation.lazy.LazyColumn(
                        Modifier.heightIn(max = Tokens.selectionHeight)
                    ) {
                        options
                            .filter { it.second.contains(query, true) }
                            .forEach { (id, text) ->
                                item(key = id) {
                                    LabelledCheckbox(text, id in selected, enabled) {
                                        change(id, it)
                                    }
                                }
                            }
                    }
                    TextButton(onClick = { open = false }) {
                        Text(resources.getString(R.string.done))
                    }
                }
            }
    }
}

@Composable
fun ConfirmDelete(title: String, busy: Boolean, onDismiss: () -> Unit, onDelete: () -> Unit) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    AlertDialog(
        onDismissRequest = { if (!busy) onDismiss() },
        title = { Text(title) },
        text = { Text(resources.getString(R.string.this_cannot_be_undone)) },
        confirmButton = {
            TextButton(enabled = !busy, onClick = onDelete) {
                Text(
                    resources.getString(R.string.action_delete),
                    color = MaterialTheme.colorScheme.error,
                )
            }
        },
        dismissButton = {
            TextButton(enabled = !busy, onClick = onDismiss) {
                Text(resources.getString(R.string.cancel))
            }
        },
    )
}

/** Hold a dirty form until the user explicitly saves or discards it. */
@Composable
fun rememberFormBackHandler(dirty: Boolean, busy: Boolean, onBack: () -> Unit): () -> Unit {
    val resources = androidx.compose.ui.platform.LocalResources.current

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
            title = { Text(resources.getString(R.string.discard_changes)) },
            text = { Text(resources.getString(R.string.your_changes_have_not_been_saved)) },
            confirmButton = {
                TextButton(
                    onClick = {
                        confirm = false
                        onBack()
                    }
                ) {
                    Text(resources.getString(R.string.discard))
                }
            },
            dismissButton = {
                TextButton(onClick = { confirm = false }) {
                    Text(resources.getString(R.string.keep_editing))
                }
            },
        )
    return back
}

@Composable
fun ErrorNotice(message: UiMessage, retry: (() -> Unit)? = null) {
    val resources = androidx.compose.ui.platform.LocalResources.current
    ErrorNotice(message.resolve(resources), retry)
}
