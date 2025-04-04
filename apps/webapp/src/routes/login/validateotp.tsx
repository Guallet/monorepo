import { supabase } from "@/auth/supabase";
import { ValidateOtpScreen } from "@/features/auth/screens/ValidateOtpScreen";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/login/validateotp")({
  validateSearch: z.object({
    email: z.string(),
    redirectTo: z.string().optional(),
  }),
  component: ValidateOtpPage,
});

function ValidateOtpPage() {
  const { email, redirectTo } = Route.useSearch();
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
            to: redirectTo ?? "/dashboard",
          });
        }
      }}
    />
  );
}
