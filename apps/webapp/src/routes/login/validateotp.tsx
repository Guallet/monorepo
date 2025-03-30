import { supabase } from "@/core/auth/supabase";
import { ValidateOtpScreen } from "@/features/auth/screens/ValidateOtpScreen";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/login/validateotp")({
  validateSearch: z.object({
    email: z.string(),
  }),
  component: ValidateOtpPage,
});

function ValidateOtpPage() {
  const { email } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <ValidateOtpScreen
      email={email}
      onValidateOtp={async (code: string) => {
        const { error, data } = await supabase.auth.verifyOtp({
          email: email,
          token: code,
          type: "email",
        });

        if (error) {
          console.error("Error verifying OTP", error);
        }
        if (data) {
          navigate({
            to: "/dashboard",
          });
        }
      }}
    />
  );
}
