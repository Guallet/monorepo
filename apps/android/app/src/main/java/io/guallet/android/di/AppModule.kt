package io.guallet.android.di

import io.guallet.android.BuildConfig
import io.guallet.android.core.network.PersistentCookies
import io.guallet.android.core.network.createApiClient
import io.guallet.android.core.security.CookieStore
import io.guallet.android.core.security.EncryptedCookieStore
import io.guallet.android.features.auth.data.BetterAuthRepository
import io.guallet.android.features.auth.domain.AuthRepository
import io.guallet.android.features.auth.presentation.AuthViewModel
import org.koin.android.ext.koin.androidContext
import org.koin.core.module.dsl.viewModelOf
import org.koin.dsl.module

val appModule = module {
    single<CookieStore> { EncryptedCookieStore(androidContext()) }
    single { PersistentCookies(get(), BuildConfig.API_BASE_URL) }
    single { createApiClient(BuildConfig.API_BASE_URL, get<PersistentCookies>()) }
    single<AuthRepository> { BetterAuthRepository(get(), get()) }
    viewModelOf(::AuthViewModel)
}
