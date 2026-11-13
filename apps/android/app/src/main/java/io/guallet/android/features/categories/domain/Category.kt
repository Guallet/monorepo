package io.guallet.android.features.categories.domain

import kotlinx.serialization.Serializable

@Serializable
data class Category(
    val id: String,
    val name: String,
    val icon: String?,
    val colour: String?,
    val parentId: String? = null,
)

@Serializable
data class CategoryInput(
    val name: String,
    val icon: String,
    val colour: String,
    val parentId: String? = null,
)
