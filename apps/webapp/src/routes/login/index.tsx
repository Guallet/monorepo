import { Navigate, createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/core/auth/supabase";
import { useAuth } from "@/core/auth/useAuth";
import { LoginScreen } from "@/features/auth/screens/LoginScreen";

const loginSearchSchema = z.object({
  redirect: z.string().catch("/dashboard"),
});

export const Route = createFileRoute("/login/")({
  validateSearch: loginSearchSchema,
  component: LoginPage,
});

function LoginPage() {
  const { session, isLoading } = useAuth();
  const { redirect } = Route.useSearch();
  const navigation = useNavigate();
  const redirectTo = `${window.location.origin}/login/callback`;

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (session) {
    return <Navigate to={redirect || "dashboard"} />;
  }

  return (
    <LoginScreen
      onGoogleLogin={async () => {
        console.log("Logging in with Google");
        // Save the redirect url in the local storage to be able to restore it later
        localStorage.setItem("redirectDestination", redirect);
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirectTo,
          },
        });
      }}
      onMagicLink={async (email: string) => {
        console.log("Sending magic link to", email);

        const { data, error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            // set this to false if you do not want the user to be automatically signed up
            shouldCreateUser: false,
            emailRedirectTo: redirectTo,
          },
        });
        if (error) {
          console.error("Error sending the OTP", error);
        } else {
          navigation({
            from: Route.fullPath,
            to: "/login/validateotp",
            search: {
              email: email,
              redirect: redirect,
            },
          });
        }
      }}
      onPassword={async (email: string, password: string) => {
        console.log("Logging in with", email, password);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        if (error) {
          console.error("Error sending the OTP", error);
        } else {
          console.log("Success", data);
        }
      }}
    />
  );
}
