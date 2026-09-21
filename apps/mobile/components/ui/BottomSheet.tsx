import {
  BottomSheet as ExpoBottomSheet,
  type BottomSheetProps as ExpoBottomSheetProps,
} from '@expo/ui';
import { useTheme } from '@guallet/luna-mobile';

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
