import {
  LoaderFunction,
  redirect,
  useLoaderData,
  Link,
} from "react-router-dom";
import { getCurrentSession, signOut } from "@core/auth/auth.helper";
import { AppRoutes } from "@router/AppRoutes";

export const loader: LoaderFunction = async () => {
  const session = await getCurrentSession();
  if (session) {
    const { error } = await signOut();
    if (error) {
      return error;
    }
  }
  return redirect("/login");
};

export function LogoutPage() {
  const data = useLoaderData();

  console.error("Error logging out the user", data);
  return <Link to={AppRoutes.HOME}>Navigate to main page</Link>;
}
