// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import GualletApp from "./RootRouter";
import { AuthProvider } from "@/core/auth/useAuth";
import { initializePostHog } from "@/core/analytics/posthog";

initializePostHog();

function App() {
  return (
    <MantineProvider>
      <Notifications />
      <AuthProvider>
        <GualletApp />
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
