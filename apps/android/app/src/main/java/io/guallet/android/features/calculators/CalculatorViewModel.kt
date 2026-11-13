package io.guallet.android.features.calculators

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.guallet.android.core.state.*
import io.guallet.android.core.state.apiError
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

data class CalculatorState(
    val busy: Boolean = false,
    val generation: Long = 0,
    val error: UiMessage? = null,
    val first: RepaymentResult? = null,
    val second: RepaymentResult? = null,
    val currency: String = "GBP",
)

class CalculatorViewModel(
    private val dispatchers: io.guallet.android.core.state.AppDispatchers =
        io.guallet.android.core.state.AppDispatchers()
) : ViewModel() {
    private val mutable = MutableStateFlow(CalculatorState())
    val state = mutable.asStateFlow()

    fun calculate(currency: String, action: () -> Pair<RepaymentResult, RepaymentResult>) {
        if (mutable.value.busy) return
        val generation = mutable.value.generation + 1
        mutable.value = CalculatorState(busy = true, currency = currency, generation = generation)
        viewModelScope.launch {
            try {
                val (first, second) = withContext(dispatchers.computation) { action() }
                mutable.value =
                    CalculatorState(
                        first = first,
                        second = second,
                        currency = currency,
                        generation = generation,
                    )
            } catch (error: Exception) {
                mutable.value =
                    CalculatorState(
                        error = apiError(error),
                        currency = currency,
                        generation = generation,
                    )
            }
        }
    }

    fun clear() {
        if (!mutable.value.busy) mutable.value = CalculatorState()
    }
}
