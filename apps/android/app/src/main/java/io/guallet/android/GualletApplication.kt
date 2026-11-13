package io.guallet.android

import android.app.Application
import io.guallet.android.di.appModule
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin

class GualletApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@GualletApplication)
            modules(appModule)
        }
    }
}
