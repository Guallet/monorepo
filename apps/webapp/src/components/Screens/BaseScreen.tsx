import { useTheme } from "@guallet/ui-react";
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
  const { colors } = useTheme();

  return (
    <Box
      style={{
        backgroundColor: colors.pageBackground,
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
