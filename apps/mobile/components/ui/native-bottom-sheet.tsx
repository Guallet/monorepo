import {
  BottomSheet as ExpoBottomSheet,
  type BottomSheetProps as ExpoBottomSheetProps,
} from '@expo/ui';
import { useTheme } from '@guallet/luna-mobile';

export type NativeBottomSheetProps = Omit<
  ExpoBottomSheetProps,
  'containerColor' | 'isPresented' | 'onDismiss'
> & {
  visible: boolean;
  onClose: () => void;
};

/**
 * Theme-aware wrapper for Expo's universal bottom sheet.
 *
 * Keeping the visibility and dismissal contract in one component makes it
 * straightforward to migrate existing `Modal`-based sheets without exposing
 * platform-specific Expo UI details to feature code.
 */
export function NativeBottomSheet({
  visible,
  onClose,
  children,
  ...props
}: Readonly<NativeBottomSheetProps>) {
  const { colors } = useTheme();

  return (
    <ExpoBottomSheet
      {...props}
      isPresented={visible}
      onDismiss={onClose}
      containerColor={colors.surface.background.primary}
    >
      {children}
    </ExpoBottomSheet>
  );
}
