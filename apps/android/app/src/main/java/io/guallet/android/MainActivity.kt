package io.guallet.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import io.guallet.android.ui.GualletApp
import io.guallet.android.ui.theme.GualletTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        // Passwords and one-time codes must not appear in screenshots or recents.
        window.addFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE)
        setContent { GualletTheme { GualletApp() } }
    }
}
