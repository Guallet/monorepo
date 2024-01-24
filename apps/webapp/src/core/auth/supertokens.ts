import { AppRoutes } from "@/router/AppRoutes";
import SuperTokens from "supertokens-auth-react";
import Session from "supertokens-auth-react/recipe/session";
import ThirdPartyPasswordless from "supertokens-auth-react/recipe/thirdpartypasswordless";

console.log("Initializing Supertokens");

export const initializeSupertokens = () =>
  SuperTokens.init({
    appInfo: {
      appName: "Guallet",
      apiDomain: import.meta.env.VITE_API_URL,
      websiteDomain: window.location.origin,
      websiteBasePath: "/login",
    },
    recipeList: [
      ThirdPartyPasswordless.init({
        contactMethod: "EMAIL",
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
          // return undefined to let the default behavior play out
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

const userIsInAllowedList = async () => {
  // TODO: Check if user is in the allowed waiting list
  return true;
};

function onUserChangeHandler() {
  console.error("'onUserChangeHandler': Function not implemented.");
}

function onTokenPayloadChangeHandler() {
  console.error("'onTokenPayloadChangeHandler': Function not implemented.");
}
function resetUser() {
  console.error("'resetUser': Function not implemented.");
}
