package io.guallet.android.features.accounts.data

import io.ktor.resources.Resource

@Resource("/accounts")
class Accounts {
    @Resource("{id}")
    class Id(val parent: Accounts = Accounts(), val id: String) {
        @Resource("transactions") class Transactions(val parent: Id)
    }
}
