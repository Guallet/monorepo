import { FileRoute } from "@tanstack/react-router";
import { ThirdPartyPasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/thirdpartypasswordless/prebuiltui";
import { getRoutingComponent } from "supertokens-auth-react/ui";

export const Route = new FileRoute("/login").createRoute({
  component: SupertokensUI,
});

function SupertokensUI() {
  return getRoutingComponent([ThirdPartyPasswordlessPreBuiltUI]);
}
