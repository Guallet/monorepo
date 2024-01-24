import { Navigate } from "@tanstack/react-router";

export const component = function Index() {
  return <Navigate to="/dashboard" replace={true} />;
};
