package io.guallet.android

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import io.guallet.android.features.auth.presentation.AuthViewModel
import io.guallet.android.ui.GualletApp
import io.guallet.android.ui.theme.GualletTheme
import org.koin.androidx.viewmodel.ext.android.viewModel

class MainActivity : ComponentActivity() {
    private val auth: AuthViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        // Passwords and one-time codes must not appear in screenshots or recents.
        window.addFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE)
        intent?.dataString?.let(auth::handleDeepLink)
        intent?.data = null
        setContent { GualletTheme { GualletApp(auth) } }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        intent.dataString?.let(auth::handleDeepLink)
        intent.data = null
        setIntent(intent)
    }
}
