import { useAuth } from "@/auth/useAuth";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/logout")({
  component: LogoutPage,
});

function LogoutPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout()
      .then(() => {
        navigate({
          to: "/",
        });
      })
      .catch((err) => {
        console.error("Error logging out the user", err);
      });
  }, []);

  return <Link to="/">Navigate to main page</Link>;
}
