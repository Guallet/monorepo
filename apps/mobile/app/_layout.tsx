import "react-native-reanimated";

import { GualletApp } from "@/components/GualletApp";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <GualletApp />
    </QueryClientProvider>
  );
}
