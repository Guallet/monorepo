import { Colors } from "@/theme/colors";
import { Box, LoadingOverlay } from "@mantine/core";
import { ReactNode } from "react";

interface BaseScreenProps {
  isLoading?: boolean;
  children: ReactNode;
  fullScreen?: boolean;
}

export function BaseScreen({
  children,
  isLoading = false,
  fullScreen = false,
}: Readonly<BaseScreenProps>) {
  return (
    <Box
      style={{
        backgroundColor: Colors.pageBackground,
        height: fullScreen ? "100dvh" : undefined,
        width: fullScreen ? "100dvw" : undefined,
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
