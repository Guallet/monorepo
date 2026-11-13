package io.guallet.android.features.notifications.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.lifecycle.compose.collectAsStateWithLifecycle
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
    FinancePage("Notifications", onBack) {
        Row {
            Checkbox(unreadOnly, onCheckedChange = { unreadOnly = it })
            Text("Unread only")
        }
        TextButton(
            enabled = !mutation.busy,
            onClick = { model.mutate { model.repository.markAllNotificationsRead() } },
        ) {
            Text("Mark all as read")
        }
        MutationFeedback(mutation)
        RemoteContent(state, model::loadNotifications) { list ->
            val shown =
                list.filter { !unreadOnly || !it.isRead }.sortedByDescending { it.createdAt }
            if (shown.isEmpty()) Text("No notifications.")
            shown.forEach { item ->
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
                            Text(if (item.isRead) "Mark unread" else "Mark read")
                        }
                        TextButton(enabled = !mutation.busy, onClick = { deleting = item }) {
                            Text("Delete")
                        }
                    }
                    notificationRoute(item.action)?.let { route ->
                        TextButton(enabled = !mutation.busy, onClick = { navigate(route) }) {
                            Text("Open")
                        }
                    }
                }
            }
        }
    }
    deleting?.let { item ->
        ConfirmDelete("Delete notification?", mutation.busy, { deleting = null }) {
            model.mutate { model.repository.deleteNotifications(item.id) }
        }
    }
}
