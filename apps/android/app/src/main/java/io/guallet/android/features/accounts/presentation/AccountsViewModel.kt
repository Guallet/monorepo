package io.guallet.android.features.accounts.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.guallet.android.features.accounts.domain.*
import io.ktor.client.plugins.ResponseException
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

data class AccountsState(
    val accounts: List<Account> = emptyList(),
    val loading: Boolean = true,
    val listError: String? = null,
    val selected: Account? = null,
    val detailsLoading: Boolean = false,
    val detailsError: String? = null,
    val transactions: List<AccountTransaction> = emptyList(),
    val transactionsLoading: Boolean = false,
    val transactionsError: String? = null,
    val saving: Boolean = false,
    val mutationError: String? = null,
    val savedId: String? = null,
    val deleted: Boolean = false,
    val unauthorized: Boolean = false,
)

class AccountsViewModel(private val repository: AccountsRepository) : ViewModel() {
    private val mutableState = MutableStateFlow(AccountsState())
    val state = mutableState.asStateFlow()
    private var listJob: Job? = null
    private var detailJob: Job? = null
    private var transactionsJob: Job? = null
    private var selectedId: String? = null

    init {
        refresh()
    }

    fun refresh() {
        listJob?.cancel()
        mutableState.update { it.copy(loading = true, listError = null) }
        listJob =
            viewModelScope.launch {
                try {
                    val accounts = repository.list()
                    mutableState.update { it.copy(accounts = accounts) }
                } catch (error: Exception) {
                    val feedback = message(error)
                    mutableState.update { it.copy(listError = feedback) }
                } finally {
                    if (isActive) mutableState.update { it.copy(loading = false) }
                }
            }
    }

    fun loadDetails(id: String) {
        detailJob?.cancel()
        transactionsJob?.cancel()
        selectedId = id
        mutableState.update {
            it.copy(
                selected = null,
                detailsLoading = true,
                detailsError = null,
                transactions = emptyList(),
                transactionsLoading = false,
                transactionsError = null,
                mutationError = null,
            )
        }
        detailJob =
            viewModelScope.launch {
                try {
                    val account = repository.get(id)
                    mutableState.update { it.copy(selected = account) }
                    loadTransactions(id)
                } catch (error: Exception) {
                    val feedback = message(error)
                    mutableState.update { it.copy(detailsError = feedback) }
                } finally {
                    if (isActive) mutableState.update { it.copy(detailsLoading = false) }
                }
            }
    }

    fun loadTransactions(id: String) {
        transactionsJob?.cancel()
        mutableState.update { it.copy(transactionsLoading = true, transactionsError = null) }
        transactionsJob =
            viewModelScope.launch {
                try {
                    val transactions = repository.transactions(id).sortedByDescending { it.date }
                    if (selectedId == id)
                        mutableState.update { it.copy(transactions = transactions) }
                } catch (error: Exception) {
                    val feedback = message(error)
                    mutableState.update { it.copy(transactionsError = feedback) }
                } finally {
                    if (isActive) mutableState.update { it.copy(transactionsLoading = false) }
                }
            }
    }

    fun clearMutation() {
        mutableState.update { it.copy(savedId = null, deleted = false, mutationError = null) }
    }

    fun save(id: String?, input: AccountInput) {
        if (mutableState.value.saving) return
        mutableState.update { it.copy(saving = true, mutationError = null, savedId = null) }
        viewModelScope.launch {
            try {
                require(input.name.isNotBlank()) { "Enter an account name." }
                val account =
                    if (id == null) repository.create(input) else repository.update(id, input)
                // Supersede any in-flight reads before applying the mutation response.
                listJob?.cancel()
                detailJob?.cancel()
                transactionsJob?.cancel()
                selectedId = account.id
                mutableState.update { current ->
                    current.copy(
                        accounts = current.accounts.filterNot { it.id == account.id } + account,
                        selected = account,
                        savedId = account.id,
                        detailsError = null,
                        loading = false,
                        detailsLoading = false,
                        transactionsLoading = false,
                    )
                }
            } catch (error: Exception) {
                val feedback = message(error)
                mutableState.update { it.copy(mutationError = feedback) }
            } finally {
                mutableState.update { it.copy(saving = false) }
            }
        }
    }

    fun delete(id: String) {
        if (mutableState.value.saving) return
        mutableState.update { it.copy(saving = true, mutationError = null, deleted = false) }
        viewModelScope.launch {
            try {
                repository.delete(id)
                listJob?.cancel()
                detailJob?.cancel()
                transactionsJob?.cancel()
                selectedId = null
                mutableState.update { current ->
                    current.copy(
                        accounts = current.accounts.filterNot { it.id == id },
                        selected = null,
                        transactions = emptyList(),
                        deleted = true,
                        loading = false,
                        detailsLoading = false,
                        transactionsLoading = false,
                    )
                }
            } catch (error: Exception) {
                val feedback = message(error)
                mutableState.update { it.copy(mutationError = feedback) }
            } finally {
                mutableState.update { it.copy(saving = false) }
            }
        }
    }

    private fun message(error: Exception): String {
        if (error is CancellationException) throw error
        if (error is IllegalArgumentException) return error.message ?: "Check the account details."
        if (error is ResponseException) {
            return when (error.response.status.value) {
                401 -> {
                    mutableState.update { it.copy(unauthorized = true) }
                    "Your session has expired. Please log in again."
                }
                404 -> "This account is no longer available."
                400,
                422 -> "Check the account details and try again."
                403 -> "You do not have permission to change this account."
                409 -> "This account cannot be changed while linked data exists."
                429 -> "Too many requests. Wait a moment and try again."
                else -> "The server could not complete the request. Try again."
            }
        }
        return "Could not connect. Check your connection and try again."
    }
}
