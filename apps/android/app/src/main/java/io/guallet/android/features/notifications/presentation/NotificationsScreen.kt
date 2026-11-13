package io.guallet.android.features.notifications.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.guallet.android.R
import io.guallet.android.features.finance.presentation.FinanceViewModel
import io.guallet.android.features.notifications.domain.*
import io.guallet.android.ui.components.*

fun notificationRoute(action: String?): String? {
    val root =
        mapOf(
            "/" to "home",
            "/dashboard" to "home",
            "/accounts" to "accounts",
            "/transactions" to "transactions",
            "/budgets" to "budgets",
            "/settings" to "settings",
            "/categories" to "categories",
            "/saving-goals" to "goals",
        )
    root[action]?.let {
        return it
    }
    val match =
        Regex(
                "^/(accounts|transactions|budgets|saving-goals)/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$"
            )
            .matchEntire(action.orEmpty()) ?: return null
    val domain = if (match.groupValues[1] == "saving-goals") "goals" else match.groupValues[1]
    return "$domain/${match.groupValues[2]}"
}

@Composable
fun NotificationsScreen(model: FinanceViewModel, onBack: () -> Unit, navigate: (String) -> Unit) {
    val resources = androidx.compose.ui.platform.LocalResources.current

    val state by model.notifications.state.collectAsStateWithLifecycle()
    val mutation by model.mutation.collectAsStateWithLifecycle()
    var unreadOnly by rememberSaveable { mutableStateOf(false) }
    var deleting by remember { mutableStateOf<Notification?>(null) }
    LaunchedEffect(Unit) {
        model.clearMutation()
        model.loadNotifications()
    }
    LaunchedEffect(mutation.completed) {
        if (mutation.completed) {
            deleting = null
            model.loadNotifications()
            model.clearMutation()
        }
    }
    FinanceListPage(resources.getString(R.string.notifications), onBack) {
        item("controls") {
            Column(
                verticalArrangement =
                    Arrangement.spacedBy(io.guallet.android.ui.theme.GualletTokens.gutter)
            ) {
                LabelledCheckbox(resources.getString(R.string.unread_only), unreadOnly) {
                    unreadOnly = it
                }
                TextButton(
                    enabled = !mutation.busy,
                    onClick = { model.mutate { model.repository.markAllNotificationsRead() } },
                ) {
                    Text(resources.getString(R.string.mark_all_as_read))
                }
                MutationFeedback(mutation)
            }
        }
        remoteItems(state, model::loadNotifications) { list ->
            val shown =
                list.filter { !unreadOnly || !it.isRead }.sortedByDescending { it.createdAt }
            if (shown.isEmpty())
                item("empty") { Text(resources.getString(R.string.no_notifications)) }
            items(shown, key = { "notification:${it.id}" }) { item ->
                FinanceCard {
                    Text(
                        item.message,
                        style =
                            if (item.isRead) MaterialTheme.typography.bodyLarge
                            else MaterialTheme.typography.titleLarge,
                    )
                    DateLabel(item.createdAt)
                    Row {
                        TextButton(
                            enabled = !mutation.busy,
                            onClick = {
                                model.mutate {
                                    model.repository.updateNotifications(
                                        item.id,
                                        NotificationUpdate(!item.isRead),
                                    )
                                }
                            },
                        ) {
                            Text(
                                if (item.isRead) resources.getString(R.string.mark_unread)
                                else resources.getString(R.string.mark_read)
                            )
                        }
                        TextButton(enabled = !mutation.busy, onClick = { deleting = item }) {
                            Text(resources.getString(R.string.action_delete))
                        }
                    }
                    notificationRoute(item.action)?.let { route ->
                        TextButton(enabled = !mutation.busy, onClick = { navigate(route) }) {
                            Text(resources.getString(R.string.open))
                        }
                    }
                }
            }
        }
    }
    deleting?.let { item ->
        ConfirmDelete(
            resources.getString(R.string.delete_notification),
            mutation.busy,
            { deleting = null },
        ) {
            model.mutate { model.repository.deleteNotifications(item.id) }
        }
    }
}
