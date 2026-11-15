package io.guallet.android.ui.components

import androidx.compose.ui.platform.UriHandler

/** An unavailable or policy-blocked browser is a recoverable UI failure. */
fun openExternalUri(handler: UriHandler, url: String): Boolean =
    try {
        handler.openUri(url)
        true
    } catch (_: IllegalArgumentException) {
        false
    } catch (_: SecurityException) {
        false
    }
