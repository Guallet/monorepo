import { signOut } from "@/core/auth/auth.helper";
import { FileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = new FileRoute("/logout").createRoute({
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
