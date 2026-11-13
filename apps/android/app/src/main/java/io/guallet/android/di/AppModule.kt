package io.guallet.android.di

import io.guallet.android.BuildConfig
import io.guallet.android.core.network.PersistentCookies
import io.guallet.android.core.network.createApiClient
import io.guallet.android.core.security.CookieStore
import io.guallet.android.core.security.EncryptedCookieStore
import io.guallet.android.features.accounts.data.KtorAccountsRepository
import io.guallet.android.features.accounts.domain.AccountsRepository
import io.guallet.android.features.accounts.presentation.AccountsViewModel
import io.guallet.android.features.auth.data.BetterAuthRepository
import io.guallet.android.features.auth.data.BrowserAuthRepository
import io.guallet.android.features.auth.data.KtorBrowserAuthRepository
import io.guallet.android.features.auth.domain.AuthRepository
import io.guallet.android.features.auth.presentation.AuthViewModel
import io.guallet.android.features.calculators.CalculatorViewModel
import io.guallet.android.features.finance.data.KtorFinanceRepository
import io.guallet.android.features.finance.domain.FinanceRepository
import io.guallet.android.features.finance.presentation.FinanceViewModel
import io.guallet.android.features.transfer.*
import io.guallet.android.ui.NativeSessionScope
import org.koin.android.ext.koin.androidContext
import org.koin.core.module.dsl.viewModel
import org.koin.core.module.dsl.viewModelOf
import org.koin.dsl.module

val appModule = module {
    single<CookieStore> { EncryptedCookieStore(androidContext()) }
    single { PersistentCookies(get(), BuildConfig.API_BASE_URL) }
    single { createApiClient(BuildConfig.API_BASE_URL, get<PersistentCookies>()) }
    single<AuthRepository> { BetterAuthRepository(get(), get()) }
    single<AccountsRepository> { KtorAccountsRepository(get()) }
    single<FinanceRepository> { KtorFinanceRepository(get()) }
    single<TransferRepository> { KtorTransferRepository(get()) }
    viewModelOf(::NativeSessionScope)
    viewModelOf(::AccountsViewModel)
    viewModelOf(::FinanceViewModel)
    viewModelOf(::ImportViewModel)
    viewModelOf(::CalculatorViewModel)
    single<BrowserAuthRepository> {
        KtorBrowserAuthRepository(get(), get(), get(), BuildConfig.API_BASE_URL)
    }
    viewModel { AuthViewModel(get(), get()) }
}
