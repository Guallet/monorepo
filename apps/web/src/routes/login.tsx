import { useState } from "react"
import { Navigate, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAuth } from "@guallet/auth"

import { authClient } from "@/auth/client"
import { LoginForm } from "@/components/login-form"

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate({ from: "/login" })
  const { isLoading, isAuthenticated, getOtpCode, loginWithProvider } = useAuth()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="grid min-h-svh place-items-center bg-background px-6 py-10 text-foreground">
        <p className="text-sm text-muted-foreground">Checking session...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const callbackURL = `${globalThis.location.origin}/login/callback`

  const handleSendOtp = async (email: string) => {
    setError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    const result = await getOtpCode(email)
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error?.message ?? "Unable to send the OTP code.")
      return
    }

    navigate({
      to: "/login/otp",
      search: {
        email,
      },
    })
  }

  const handleSendMagicLink = async (email: string) => {
    setError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    const { error: magicLinkError } = await authClient.signIn.magicLink({
      email,
      callbackURL,
      errorCallbackURL: callbackURL,
    })

    setIsSubmitting(false)

    if (magicLinkError) {
      setError(magicLinkError.message ?? "Unable to send magic link.")
      return
    }

    setSuccessMessage("Magic link sent. Check your inbox to continue.")
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    const result = await loginWithProvider("google", callbackURL)
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error?.message ?? "Unable to start Google sign-in.")
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          onSendOtp={handleSendOtp}
          onSendMagicLink={handleSendMagicLink}
          onGoogleSignIn={handleGoogleSignIn}
          isPending={isSubmitting}
          error={error}
          successMessage={successMessage}
        />
      </div>
    </div>
  )
}