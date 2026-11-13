package io.guallet.android.features.notifications.domain

import kotlinx.serialization.Serializable

@Serializable
data class Notification(
    val id: String,
    val message: String,
    val type: String,
    val isRead: Boolean,
    val createdAt: String,
    val icon: String? = null,
    val action: String? = null,
)

@Serializable data class NotificationUpdate(val isRead: Boolean)
