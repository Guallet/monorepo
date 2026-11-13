package io.guallet.android.features.categories.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.guallet.android.R
import io.guallet.android.features.categories.domain.*
import io.guallet.android.features.finance.presentation.FinanceViewModel
import io.guallet.android.ui.components.*

/** Preserve the mobile app’s two-level category hierarchy. */
fun availableParents(categories: List<Category>, id: String?): List<Category> {
    if (id != null && categories.any { it.parentId == id }) return emptyList()
    return categories.filter { it.parentId == null && it.id != id }
}

@Composable
fun CategoriesScreen(model: FinanceViewModel, onBack: () -> Unit) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val state by model.categories.state.collectAsStateWithLifecycle()
    val mutation by model.mutation.collectAsStateWithLifecycle()
    var editingId by rememberSaveable { mutableStateOf<String?>(null) }
    var creating by rememberSaveable { mutableStateOf(false) }
    var deleting by remember { mutableStateOf<Category?>(null) }
    var search by rememberSaveable { mutableStateOf("") }
    LaunchedEffect(Unit) {
        model.loadCategories()
        model.clearMutation()
    }
    LaunchedEffect(mutation.completed) {
        if (mutation.completed) {
            creating = false
            editingId = null
            deleting = null
            model.loadCategories()
            model.clearMutation()
        }
    }
    val editing = state.value?.find { it.id == editingId }
    if (creating || editing != null) {
        key(editingId, creating) {
            CategoryEditor(
                editing,
                state.value.orEmpty(),
                model,
                onBack = {
                    creating = false
                    editingId = null
                    model.clearMutation()
                },
            )
        }
        return
    }
    FinanceListPage(resources.getString(R.string.categories), onBack) {
        item("controls") {
            Column(
                verticalArrangement =
                    Arrangement.spacedBy(io.guallet.android.ui.theme.GualletTokens.gutter)
            ) {
                Button(
                    enabled = !mutation.busy,
                    onClick = {
                        creating = true
                        model.clearMutation()
                    },
                ) {
                    Text(resources.getString(R.string.add_category))
                }
                MutationFeedback(mutation)
                TextField(
                    resources.getString(R.string.search_categories),
                    search,
                    onChange = { search = it },
                )
            }
        }
        remoteItems(state, model::loadCategories) { categories ->
            if (categories.isEmpty())
                item("seed") {
                    Text(resources.getString(R.string.no_categories_yet))
                    OutlinedButton(
                        enabled = !mutation.busy,
                        onClick = { model.mutate { model.repository.seedCategories() } },
                    ) {
                        Text(resources.getString(R.string.add_default_categories))
                    }
                }
            val visible =
                categories
                    .filter { it.name.contains(search, ignoreCase = true) }
                    .sortedBy { it.name.lowercase() }
            if (visible.isEmpty() && categories.isNotEmpty())
                item("empty") { Text(resources.getString(R.string.no_matching_categories)) }
            items(visible, key = { "category:${it.id}" }) { category ->
                FinanceCard {
                    CategorySymbol(category.icon, category.colour)
                    Text(category.name, style = MaterialTheme.typography.titleLarge)
                    category.parentId?.let { parent ->
                        Text(
                            resources.getString(
                                R.string.parent_value,
                                categories.find { it.id == parent }?.name
                                    ?: resources.getString(R.string.unavailable),
                            )
                        )
                    }
                    Row {
                        TextButton(
                            enabled = !mutation.busy,
                            onClick = {
                                editingId = category.id
                                model.clearMutation()
                            },
                        ) {
                            Text(resources.getString(R.string.edit))
                        }
                        TextButton(enabled = !mutation.busy, onClick = { deleting = category }) {
                            Text(resources.getString(R.string.action_delete))
                        }
                    }
                }
            }
        }
    }
    deleting?.let { category ->
        ConfirmDelete(
            resources.getString(R.string.delete_value, category.name),
            mutation.busy,
            { deleting = null },
        ) {
            model.mutate { model.repository.deleteCategories(category.id) }
        }
    }
}

@Composable
private fun CategoryEditor(
    category: Category?,
    categories: List<Category>,
    model: FinanceViewModel,
    onBack: () -> Unit,
) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    var name by rememberSaveable { mutableStateOf(category?.name.orEmpty()) }
    var icon by rememberSaveable { mutableStateOf(category?.icon ?: "IconTag") }
    var colour by rememberSaveable { mutableStateOf(category?.colour ?: "#005EB8") }
    var parent by rememberSaveable { mutableStateOf(category?.parentId ?: "") }
    var error by remember { mutableStateOf<String?>(null) }
    val mutation by model.mutation.collectAsStateWithLifecycle()
    val dirty =
        name != category?.name.orEmpty() ||
            icon != (category?.icon ?: "IconTag") ||
            colour != (category?.colour ?: "#005EB8") ||
            parent != category?.parentId.orEmpty()
    val back = rememberFormBackHandler(dirty, mutation.busy, onBack)
    FinancePage(
        if (category == null) resources.getString(R.string.add_category)
        else resources.getString(R.string.edit_category),
        back,
    ) {
        TextField(
            resources.getString(R.string.name),
            name,
            !mutation.busy,
            onChange = {
                name = it
                error = null
            },
        )
        IconChoiceField(icon, !mutation.busy) { icon = it }
        TextField(
            resources.getString(R.string.colour_rrggbb),
            colour,
            !mutation.busy,
            onChange = {
                colour = it
                error = null
            },
        )
        ChoiceField(
            resources.getString(R.string.parent_category),
            parent,
            listOf("" to resources.getString(R.string.none)) +
                availableParents(categories, category?.id).map { it.id to it.name },
            !mutation.busy,
        ) {
            parent = it
        }
        error?.let { ErrorNotice(it) }
        MutationFeedback(mutation)
        Button(
            enabled = !mutation.busy,
            onClick = {
                if (name.isBlank() || !Regex("#[0-9a-fA-F]{6}").matches(colour))
                    error = resources.getString(R.string.enter_a_name_and_a_six_digit_hex_colour)
                else
                    model.mutate {
                        val input =
                            CategoryInput(name.trim(), icon, colour, parent.ifBlank { null })
                        if (category == null) model.repository.createCategories(input)
                        else model.repository.updateCategories(category.id, input)
                    }
            },
        ) {
            Text(resources.getString(R.string.save_category))
        }
        TextButton(enabled = !mutation.busy, onClick = back) {
            Text(resources.getString(R.string.cancel))
        }
    }
}
