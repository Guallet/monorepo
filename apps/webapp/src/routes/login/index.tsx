import { Navigate, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/core/auth/supabase";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useAuth } from "@/core/auth/useAuth";

export const Route = createFileRoute("/login/")({
  validateSearch: z.object({
    redirect: z.string().catch("/dashboard"),
  }),
  component: LoginPage,
});

function LoginPage() {
  const { session, isLoading } = useAuth();
  const { redirect } = Route.useSearch();
  // const redirectTo = window.location.host + redirect || "/dashboard";
  // const redirectTo = `${window.location.origin}/login/callback`;
  const redirectTo = `${window.location.origin}/login/callback`;
  // ?redirect=${
  //   redirect || "dashboard"
  // }`;

  // function handleLogin() {
  //   navigate({ to: redirect });
  // }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (session) {
    return <Navigate to={redirect} />;
  }

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      providers={["google"]}
      redirectTo={redirectTo}
    />
  );
}
