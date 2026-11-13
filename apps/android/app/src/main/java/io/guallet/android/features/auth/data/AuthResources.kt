package io.guallet.android.features.auth.data

import io.ktor.resources.Resource

@Resource("/auth")
class Auth {
    @Resource("get-session") class Session(val parent: Auth = Auth())

    @Resource("sign-in/email") class SignIn(val parent: Auth = Auth())

    @Resource("sign-up/email") class SignUp(val parent: Auth = Auth())

    @Resource("sign-out") class SignOut(val parent: Auth = Auth())

    @Resource("email-otp/send-verification-otp") class SendCode(val parent: Auth = Auth())

    @Resource("sign-in/email-otp") class VerifyCode(val parent: Auth = Auth())

    @Resource("email-otp/request-password-reset") class RequestReset(val parent: Auth = Auth())

    @Resource("email-otp/reset-password") class ResetPassword(val parent: Auth = Auth())
}
