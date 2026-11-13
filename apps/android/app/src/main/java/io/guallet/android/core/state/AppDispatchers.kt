package io.guallet.android.core.state

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers

/** Inject execution contexts so blocking work and CPU preparation remain main-safe and testable. */
data class AppDispatchers(
    val io: CoroutineDispatcher = Dispatchers.IO,
    val computation: CoroutineDispatcher = Dispatchers.Default,
)
