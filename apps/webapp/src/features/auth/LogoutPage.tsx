import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/useAuth";

// export async function loader() {
//   const { data, error } = await supabase.auth.signOut();
//   const { data, error } = await supabase.auth.
//   return { contacts };
// }

export function LogoutPage() {
  const navigation = useNavigate();
  const { session, loading, signOut } = useAuth();

  useEffect(() => {
    const logoutUser = async () => {
      if (session) {
        const error = await signOut();
        if (error) {
          // TODO: Navigate to error page?
          console.error(error);
        } else {
          console.log("No error, navigating to login");
          // Navigate to login
          navigation("/login", {
            replace: true,
          });
        }
      } else {
        console.log("No user, navigating to login");
        // No user? Just redirect to login page
        navigation("/login", {
          replace: true,
        });
      }
    };

    logoutUser().catch((e) => {
      // Set error
      console.error("Error login user", e);
    });
  }, [session]);

  if (loading) {
    return <div>Loading... Please don't close this page</div>;
  }
  return <div>Done!</div>;
}
