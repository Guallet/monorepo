package io.guallet.android.features.calculators

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.guallet.android.core.state.apiError
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

data class CalculatorState(
    val busy: Boolean = false,
    val error: String? = null,
    val first: RepaymentResult? = null,
    val second: RepaymentResult? = null,
    val currency: String = "GBP",
)

class CalculatorViewModel : ViewModel() {
    private val mutable = MutableStateFlow(CalculatorState())
    val state = mutable.asStateFlow()

    fun calculate(currency: String, action: () -> Pair<RepaymentResult, RepaymentResult>) {
        if (mutable.value.busy) return
        mutable.value = CalculatorState(busy = true, currency = currency)
        viewModelScope.launch {
            try {
                val (first, second) = withContext(Dispatchers.Default) { action() }
                mutable.value = CalculatorState(first = first, second = second, currency = currency)
            } catch (error: Exception) {
                mutable.value = CalculatorState(error = apiError(error), currency = currency)
            }
        }
    }

    fun clear() {
        if (!mutable.value.busy) mutable.value = CalculatorState()
    }
}
