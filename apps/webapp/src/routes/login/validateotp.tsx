import { ValidateOtp } from "@guallet/auth-react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/login/validateotp")({
  validateSearch: z.object({
    email: z.string(),
  }),
  component: ValidateOtpPage,
});

function ValidateOtpPage() {
  const { email } = Route.useSearch();

  return (
    <ValidateOtp
      email={email}
      onValidateOtp={(code: string) => {
        console.log("Validating OTP", code);
      }}
      onGoBack={() => {
        console.log("Going back");
      }}
    />
  );
}
