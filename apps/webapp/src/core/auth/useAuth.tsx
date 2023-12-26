import React, { useState, useContext, useCallback } from "react";
import { Analytics } from "@core/analytics/Analytics";
import Session, {
  useSessionContext,
} from "supertokens-auth-react/recipe/session";
import { UserDto } from "@/features/user/api/user.api";
import { signOut } from "./auth.helper";

import SuperTokens from "supertokens-auth-react";
import ThirdPartyPasswordless from "supertokens-auth-react/recipe/thirdpartypasswordless";
import { AppRoutes } from "@/router/AppRoutes";
import { get } from "@core/api/fetchHelper";

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

  const init = useCallback(() => {
    console.log("Initializing Supertokens");
    SuperTokens.init({
      appInfo: {
        appName: "Guallet",
        apiDomain: import.meta.env.VITE_API_URL,
        websiteDomain: window.location.origin,
        websiteBasePath: "/login",
      },
      recipeList: [
        ThirdPartyPasswordless.init({
          contactMethod: "EMAIL_OR_PHONE",
          signInUpFeature: {
            providers: [
              ThirdPartyPasswordless.Google.init(),
              // ThirdPartyPasswordless.Apple.init(),
            ],
          },
          async getRedirectionURL(context) {
            if (context.action === "SUCCESS") {
              // called on a successful sign in / up. Where should the user go next?
              if (context.isNewPrimaryUser) {
                // user signed up
                // TODO: Check if user has account and/or it's in the waiting list
                return AppRoutes.Auth.REGISTER;
              } else {
                // Check if user can register
                if (await userIsInAllowedList()) {
                  const redirectToPath = context.redirectToPath;
                  if (redirectToPath !== undefined) {
                    // we are navigating back to where the user was before they authenticated
                    return redirectToPath;
                  }
                  // user signed in
                  return AppRoutes.DASHBOARD;
                } else {
                  // User is not in the waiting list. So redirect to "Get an invitation" page
                  return AppRoutes.Auth.WAITING_LIST;
                }
              }
            }
            // return undefined to let the default behaviour play out
            return undefined;
          },
        }),
        Session.init({
          // sessionTokenFrontendDomain: ".guallet.io",
          onHandleEvent: (context) => {
            console.log("Supertokens auth changed", context);

            if (context.action === "SIGN_OUT") {
              // called when the user clicks on sign out
              resetUser();
            } else if (context.action === "REFRESH_SESSION") {
              // called with refreshing a session
              // NOTE: This is an undeterministic event
            } else if (context.action === "UNAUTHORISED") {
              // called when the user doesn't have a valid session but made a request that requires one
              // NOTE: This event can fire multiple times

              if (context.sessionExpiredOrRevoked) {
                // the sessionExpiredOrRevoked property is set to true if the current call cleared the session from storage
                // this happens only once, even if multiple tabs sharing the same session are open, making it useful for analytics purposes
              }
            } else if (context.action === "SESSION_CREATED") {
              // Called when session is created - post login / sign up.
              onUserChangeHandler();
            } else if (context.action === "ACCESS_TOKEN_PAYLOAD_UPDATED") {
              // This is called when the access token payload has been updated
              onTokenPayloadChangeHandler();
            }
          },
        }),
      ],
    });
  }, []);

  // useEffect(() => {
  init();
  // }, []);

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
      getUserProfile();
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

  const userIsInAllowedList = async () => {
    // TODO: Check if user is in the allowed list
    return true;
  };

  const getUserProfile = async () => {
    if (userId) {
      const user = await get<UserDto>(`/users/${userId}`);
      setUser(user);
      setAnalyticsIdentity(user);
      return user;
    } else {
      setUser(null);
      setAnalyticsIdentity(null);
      return null;
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
