import { Navigate, createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/core/auth/supabase";
import { useAuth } from "@/core/auth/useAuth";
import { GualletLogin } from "@guallet/auth-react"; // Import the missing component

export const Route = createFileRoute("/login/")({
  validateSearch: z.object({
    redirect: z.string().catch("/dashboard"),
  }),
  component: LoginPage,
});

function LoginPage() {
  const { session, isLoading } = useAuth();
  const { redirect } = Route.useSearch();
  const navigation = useNavigate();
  const redirectTo = `${window.location.origin}/login/callback?redirect=${
    redirect || "dashboard"
  }`;

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (session) {
    return <Navigate to={redirect || "dashboard"} />;
  }

  return (
    <GualletLogin
      onGoogleLogin={async () => {
        console.log("Logging in with Google", redirectTo);
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
