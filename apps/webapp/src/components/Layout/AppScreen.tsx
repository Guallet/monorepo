import { Box, Center, Loader, LoadingOverlay } from "@mantine/core";
import { ReactNode } from "react";

interface AppScreenProps {
  isLoading?: boolean;
  children: ReactNode;
}

/**
 * @deprecated Use BaseScreen instead
 */
export function AppScreen({
  children,
  isLoading = false,
}: Readonly<AppScreenProps>) {
  if (isLoading) {
    return (
      <Box
        style={{
          display: "grid",
          gridRow: 1,
          height: "50vh",
          placeItems: "center",
        }}
      >
        <Center>
          <Loader />
        </Center>
      </Box>
    );
  }

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      {children}
    </Box>
  );
}
