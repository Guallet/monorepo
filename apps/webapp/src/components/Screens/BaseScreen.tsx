import { Colors } from "@/theme/colors";
import { Box, LoadingOverlay } from "@mantine/core";
import { ReactNode } from "react";

interface AppScreenProps {
  isLoading?: boolean;
  children: ReactNode;
}

export function BaseScreen({
  children,
  isLoading = false,
}: Readonly<AppScreenProps>) {
  return (
    <Box
      style={{
        backgroundColor: Colors.pageBackground,
        height: "100vh",
        width: "100vw",
      }}
    >
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      {children}
    </Box>
  );
}
