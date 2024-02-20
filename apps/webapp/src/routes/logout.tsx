import { useAuth } from "@/core/auth/useAuth";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/logout")({
  component: LogoutPage,
});

// async function loader() {
//   console.log("logging user out");
//   await signOut();
//   // throw redirect({
//   //   to: "/",
//   // });
//   return { data: "logged out" };
// }

function LogoutPage() {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut()
      .then(() => {
        console.log("logged out");
      })
      .catch((err) => {
        console.error("Error logging out the user", err);
      })
      .finally(() => {
        console.log("finally");
      });
  }, []);

  return <Link to="/">Navigate to main page</Link>;
}
