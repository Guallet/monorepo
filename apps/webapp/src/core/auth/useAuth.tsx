import React, { useState, useEffect, useContext } from "react";
import { Analytics } from "@core/analytics/Analytics";
import Session, {
  useSessionContext,
} from "supertokens-auth-react/recipe/session";
import { UserDto } from "@/features/user/api/user.api";
import { signOut } from "./auth.helper";

interface AuthContextType {
  user: UserDto | null;
  userId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  userId: null,
  loading: false,
  signOut: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserDto | null>(null);
  const [jwtPayload, setJwtPayload] = useState<unknown | null>(null);
  const { loading } = useSessionContext();

  const init = async () => {
    if (await Session.doesSessionExist()) {
      const user_id = await Session.getUserId();
      setUserId(user_id);
      const jwt_payload = await Session.getAccessTokenPayloadSecurely();
      setJwtPayload(jwt_payload);
    }
  };

  // const setAnalyticsIdentity = (user: UserDto | null) => {
  //   if (user) {
  //     Analytics.setIdentity(user.id, {
  //       email: user.email ?? "",
  //       name: user.user_metadata?.name ?? "",
  //       user_id: user.id,
  //     });
  //   } else {
  //     Analytics.resetIdentity();
  //   }
  // };

  useEffect(() => {
    init();
  }, []);

  const logout = async () => {
    await signOut();
  };

  const state = {
    user: user,
    userId: userId,
    loading: loading,
    signOut: logout,
  };

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
