import {
  BottomSheet as ExpoBottomSheet,
  type BottomSheetProps as ExpoBottomSheetProps,
} from '@expo/ui';
import {
  DateRangeSheetProvider,
  useTheme,
  type DateRangeSheetProps,
} from '@guallet/luna-mobile';
import type { ReactNode } from 'react';

export type BottomSheetProps = ExpoBottomSheetProps;

/**
 * Theme-aware wrapper for Expo's universal bottom sheet.
 *
 * Keeping the visibility and dismissal contract in one component makes it
 * straightforward to migrate existing `Modal`-based sheets without exposing
 * platform-specific Expo UI details to feature code.
 */
export function BottomSheet({
  containerColor,
  ...props
}: Readonly<BottomSheetProps>) {
  const { colors } = useTheme();

  return (
    <ExpoBottomSheet
      {...props}
      containerColor={containerColor ?? colors.surface.background.primary}
    />
  );
}

function DateRangeBottomSheet({
  visible,
  onDismiss,
  children,
}: Readonly<DateRangeSheetProps>) {
  return (
    <BottomSheet
      isPresented={visible}
      onDismiss={onDismiss}
      snapPoints={['full']}
      contentPadding={0}
    >
      {children}
    </BottomSheet>
  );
}

/** Keeps Luna's reusable picker on the app's single Expo sheet integration. */
export function LunaBottomSheetProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <DateRangeSheetProvider sheet={DateRangeBottomSheet}>
      {children}
    </DateRangeSheetProvider>
  );
}
