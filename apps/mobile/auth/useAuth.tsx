import React, { useEffect } from "react";
import SuperTokens from "supertokens-react-native";

const AuthContext = React.createContext<{
  signIn: () => void;
  signOut: () => void;
  hasSession: boolean;
  user?: string | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  hasSession: false,
  user: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useAuth() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useAuth must be wrapped in a <AuthProvider />");
    }
  }

  return value;
}

export function AuthProvider(props: React.PropsWithChildren) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasSession, setHasSession] = React.useState<boolean>(false);
  const [user, setUser] = React.useState<string | null>(null);

  useEffect(() => {
    // Perform any async loading here
    setIsLoading(true);
    SuperTokens.doesSessionExist()
      .then((exists) => {
        setHasSession(exists);
      })
      .catch((err) => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn: () => {
          // Perform sign-in logic here
          //   setSession("xxx");
        },
        signOut: () => {
          //   setSession(null);
        },
        hasSession,
        user,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
