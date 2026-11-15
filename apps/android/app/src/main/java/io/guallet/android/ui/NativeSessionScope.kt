package io.guallet.android.ui

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelStore

/** Retain per-user finance state across rotation; the UI clears it on sign-out. */
class NativeSessionScope : ViewModel() {
    val store = ViewModelStore()

    override fun onCleared() {
        store.clear()
    }
}

internal fun Context.activity(): Activity? {
    var current: Context = this
    while (current is ContextWrapper) {
        if (current is Activity) return current
        current = current.baseContext
    }
    return current as? Activity
}
