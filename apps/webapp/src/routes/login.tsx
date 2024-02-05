import { createFileRoute } from "@tanstack/react-router";
import { ThirdPartyPasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/thirdpartypasswordless/prebuiltui";
import { getRoutingComponent } from "supertokens-auth-react/ui";

export const Route = createFileRoute("/login")({
  component: SupertokensUI,
});

function SupertokensUI() {
  return getRoutingComponent([ThirdPartyPasswordlessPreBuiltUI]);
}
