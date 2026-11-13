package io.guallet.android.features.accounts.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.guallet.android.R
import io.guallet.android.core.state.*
import io.guallet.android.features.accounts.domain.*
import io.ktor.client.plugins.ResponseException
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

data class AccountsState(
    val accounts: List<Account> = emptyList(),
    val loading: Boolean = true,
    val listError: UiMessage? = null,
    val selected: Account? = null,
    val detailsLoading: Boolean = false,
    val detailsError: UiMessage? = null,
    val transactions: List<AccountTransaction> = emptyList(),
    val transactionsLoading: Boolean = false,
    val transactionsError: UiMessage? = null,
    val saving: Boolean = false,
    val mutationError: UiMessage? = null,
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
                    ensureActive()
                    mutableState.update { it.copy(accounts = accounts) }
                } catch (error: Exception) {
                    ensureActive()
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
                selected = it.selected?.takeIf { account -> account.id == id },
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
                    ensureActive()
                    mutableState.update { it.copy(selected = account) }
                    loadTransactions(id)
                } catch (error: Exception) {
                    ensureActive()
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
                    ensureActive()
                    if (selectedId == id)
                        mutableState.update { it.copy(transactions = transactions) }
                } catch (error: Exception) {
                    ensureActive()
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
                require(input.name.isNotBlank()) {
                    throw UiMessageException(uiMessage(R.string.message_enter_an_account_name))
                }
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

    private fun message(error: Exception): UiMessage {
        if (error is CancellationException) throw error
        if (error is UiMessageException) return error.text
        if (error is IllegalArgumentException)
            return error.message?.let(UiMessage::Text)
                ?: uiMessage(R.string.message_check_the_account_details)
        if (error is ResponseException) {
            return when (error.response.status.value) {
                401 -> {
                    mutableState.update { it.copy(unauthorized = true) }
                    uiMessage(R.string.message_your_session_has_expired_please_log_in_again)
                }
                404 -> uiMessage(R.string.message_this_account_is_no_longer_available)
                400,
                422 -> uiMessage(R.string.message_check_the_account_details_and_try_again)
                403 -> uiMessage(R.string.message_you_do_not_have_permission_to_change_this_account)
                409 ->
                    uiMessage(
                        R.string.message_this_account_cannot_be_changed_while_linked_data_exists
                    )
                429 -> uiMessage(R.string.message_too_many_requests_wait_a_moment_and_try_again)
                else ->
                    uiMessage(R.string.message_the_server_could_not_complete_the_request_try_again)
            }
        }
        return uiMessage(R.string.message_could_not_connect_check_your_connection_and_try_again)
    }
}
