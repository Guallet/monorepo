import { useTheme } from '@guallet/ui-react';
import { Box, LoadingOverlay } from '@mantine/core';
import { ReactNode } from 'react';
import { ScreenHeader, ScreenHeaderSearch } from './ScreenHeader';

interface BaseScreenProps {
  isLoading?: boolean;
  children: ReactNode;
  fullScreen?: boolean;
  title?: string;
  actions?: ReactNode;
  search?: ScreenHeaderSearch;
  pinnedHeader?: boolean;
}

export function BaseScreen({
  children,
  isLoading = false,
  fullScreen = false,
  title,
  actions,
  search,
  pinnedHeader = true,
}: Readonly<BaseScreenProps>) {
  const { colors, spacing } = useTheme();

  return (
    <Box
      style={{
        backgroundColor: colors.pageBackground,
        height: fullScreen ? '100dvh' : undefined,
        width: fullScreen ? '100dvw' : undefined,
      }}
    >
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      {title && (
        <ScreenHeader
          title={title}
          actions={actions}
          search={search}
          pinned={pinnedHeader}
        />
      )}
      {title ? <Box pt={spacing.md}>{children}</Box> : children}
    </Box>
  );
}
