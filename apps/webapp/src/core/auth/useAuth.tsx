import React, { useState, useContext, useEffect } from "react";
import { Analytics } from "@core/analytics/Analytics";
import Session, {
  useSessionContext,
} from "supertokens-auth-react/recipe/session";
import { UserDto } from "@/features/user/api/user.api";
import { signOut } from "./auth.helper";
import { get } from "../api/fetchHelper";

interface AuthContextType {
  user: UserDto | null;
  userId: string | null;
  loading: boolean;
  jwtPayload: unknown | null;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  userId: null,
  loading: false,
  jwtPayload: null,
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

  useEffect(() => {
    onUserChangeHandler();
  }, [userId]);

  const resetUser = () => {
    setUser(null);
    setUserId(null);
    setAnalyticsIdentity(null);
    setJwtPayload(null);
  };

  const onUserChangeHandler = async () => {
    if (await Session.doesSessionExist()) {
      const user_id = await Session.getUserId();
      setUserId(user_id);
      getUserProfile(user_id);
      onTokenPayloadChangeHandler();
    } else {
      resetUser();
    }
  };

  const onTokenPayloadChangeHandler = async () => {
    if (await Session.doesSessionExist()) {
      const jwt_payload = await Session.getAccessTokenPayloadSecurely();
      setJwtPayload(jwt_payload);
    } else {
      setJwtPayload(null);
    }
  };

  const getUserProfile = async (userId: string) => {
    if (userId) {
      const user = await get<UserDto>(`users`);
      setUser(user);
      setAnalyticsIdentity(user);
    } else {
      setUser(null);
      setAnalyticsIdentity(null);
    }
  };

  const setAnalyticsIdentity = (user: UserDto | null) => {
    if (userId && user) {
      Analytics.setIdentity(userId, {
        email: user.email,
        name: user.name,
        user_id: userId,
      });
    } else {
      Analytics.resetIdentity();
    }
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setUserId(null);
    setAnalyticsIdentity(null);
  };

  const state = {
    user: user,
    userId: userId,
    loading: loading,
    jwtPayload: jwtPayload,
    signOut: logout,
  };

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
