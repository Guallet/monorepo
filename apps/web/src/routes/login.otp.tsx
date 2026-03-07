import { type FormEvent, useMemo, useState } from "react"
import { Navigate, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAuth } from "@guallet/auth"

import { Button } from "@/components/ui/button"

interface OtpSearch {
  email: string
}

export const Route = createFileRoute("/login/otp")({
  validateSearch: (search): OtpSearch => ({
    email: typeof search.email === "string" ? search.email : "",
  }),
  component: OtpVerificationPage,
})

function OtpVerificationPage() {
  const { email } = Route.useSearch()
  const navigate = useNavigate({ from: "/login/otp" })
  const { isLoading, isAuthenticated, verifyOtpCode, getOtpCode } = useAuth()

  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const maskedEmail = useMemo(() => {
    const [name, domain] = email.split("@")
    if (!name || !domain || name.length < 2) {
      return email
    }

    return `${name[0]}***${name[name.length - 1]}@${domain}`
  }, [email])

  if (!email) {
    return <Navigate to="/login" replace />
  }

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (code.length < 4) {
      setError("Please enter the OTP code from your email.")
      return
    }

    setError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    const result = await verifyOtpCode(email, code)
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error?.message ?? "The code is invalid or expired.")
      return
    }

    navigate({ to: "/dashboard" })
  }

  const handleResend = async () => {
    setError(null)
    setSuccessMessage(null)
    setIsResending(true)

    const result = await getOtpCode(email)
    setIsResending(false)

    if (!result.success) {
      setError(result.error?.message ?? "Unable to resend OTP code.")
      return
    }

    setSuccessMessage("A new OTP code has been sent.")
  }

  return (
    <main className="grid min-h-svh place-items-center bg-[linear-gradient(160deg,hsl(198_75%_96%)_0%,hsl(0_0%_100%)_46%,hsl(168_45%_95%)_100%)] px-6 py-10 text-foreground">
      <section className="w-full max-w-md rounded-3xl border border-border/70 bg-card/95 p-8 shadow-2xl backdrop-blur">
        <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          OTP Verification
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Confirm your sign-in
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Enter the code sent to {maskedEmail} to continue to your dashboard.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium" htmlFor="otp-code">
            <span>One-time code</span>
            <input
              id="otp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => {
                const nextValue = event.target.value.replaceAll(/\D/g, "")
                setCode(nextValue.slice(0, 8))
              }}
              placeholder="123456"
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/40"
            />
          </label>

          <Button type="submit" disabled={isSubmitting || code.length < 4}>
            {isSubmitting ? "Verifying..." : "Verify code"}
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full"
          onClick={handleResend}
          disabled={isResending}
        >
          {isResending ? "Resending..." : "Resend code"}
        </Button>

        {error ? (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {successMessage ? (
          <p className="mt-4 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}
      </section>
    </main>
  )
}