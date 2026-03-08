import { type ComponentProps, type FormEvent, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  FieldError,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { GalleryVerticalEndIcon, MailIcon } from "lucide-react"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface LoginFormProps extends ComponentProps<"div"> {
  onSendOtp: (email: string) => Promise<void>
  onSendMagicLink: (email: string) => Promise<void>
  onGoogleSignIn: () => Promise<void>
  isPending?: boolean
  error?: string | null
  successMessage?: string | null
}

export function LoginForm({
  onSendOtp,
  onSendMagicLink,
  onGoogleSignIn,
  isPending = false,
  error,
  successMessage,
  className,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email])
  const isEmailValid = EMAIL_PATTERN.test(normalizedEmail)
  const displayedError = validationError ?? error ?? null

  const ensureEmail = () => {
    if (!isEmailValid) {
      setValidationError("Please enter a valid email address.")
      return false
    }

    setValidationError(null)
    return true
  }

  const handleOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!ensureEmail()) {
      return
    }

    await onSendOtp(normalizedEmail)
  }

  const handleMagicLink = async () => {
    if (!ensureEmail()) {
      return
    }

    await onSendMagicLink(normalizedEmail)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleOtpSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon className="size-6" />
              </div>
              <span className="sr-only">Guallet</span>
            </div>
            <h1 className="text-xl font-bold">Welcome to Guallet</h1>
            <FieldDescription>
              Continue with OTP, magic link, or Google.
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="m@example.com"
              required
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isPending || !isEmailValid}>
              {isPending ? "Sending code..." : "Continue with OTP"}
            </Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-2">
            <Button
              variant="outline"
              type="button"
              disabled={isPending || !isEmailValid}
              onClick={handleMagicLink}
            >
              <MailIcon data-icon="inline-start" />
              Send magic link
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={isPending}
              onClick={onGoogleSignIn}
            >
              <svg
                data-icon="inline-start"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </Field>

          {displayedError ? <FieldError>{displayedError}</FieldError> : null}

          {successMessage ? (
            <FieldDescription>{successMessage}</FieldDescription>
          ) : null}
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center text-xs">
        By continuing, you agree to the Guallet terms and privacy policy.
      </FieldDescription>
    </div>
  )
}
