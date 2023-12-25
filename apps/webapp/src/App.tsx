// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { SuperTokensWrapper } from "supertokens-auth-react";
import { initializePostHog } from "@core/analytics/posthog";
import { initSupertokens } from "./core/auth/supertokens.config";
import GualletApp from "./RootRouter";

initializePostHog();
initSupertokens();

function App() {
  return (
    <SuperTokensWrapper>
      <MantineProvider>
        <Notifications />
        {/* <AuthProvider> */}
        <GualletApp />
        {/* </AuthProvider> */}
      </MantineProvider>
    </SuperTokensWrapper>
  );
}

export default App;
