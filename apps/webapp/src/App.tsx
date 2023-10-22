// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";

import GualletApp from "./RootRouter";
import { AuthProvider } from "./core/auth/useAuth";
import { initSentry } from "./sentry";

initSentry();

function App() {
  return (
    <MantineProvider>
      <AuthProvider>
        <GualletApp />
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
