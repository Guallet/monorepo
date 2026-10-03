import {
  BottomSheet as ExpoBottomSheet,
  RNHostView,
  type BottomSheetProps as ExpoBottomSheetProps,
} from '@expo/ui';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  DateRangeSheetProvider,
  type DateRangeSheetProps,
} from '../components/inputs/DateRangePicker/DateRangeSheetProvider';
import { useTheme } from '../theme';

export type BottomSheetProps = ExpoBottomSheetProps;

/** Theme-aware wrapper around Expo's universal bottom sheet. */
export function BottomSheet({
  children,
  containerColor,
  contentPadding,
  showDragIndicator = true,
  snapPoints,
  ...props
}: Readonly<BottomSheetProps>) {
  const { colors, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const fitToContents = !snapPoints?.length;
  const padding = contentPadding ?? {
    top: spacing.md,
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  };
  const horizontalPadding =
    typeof padding === 'number'
      ? padding * 2
      : (padding.left ?? 0) + (padding.right ?? 0);

  return (
    <ExpoBottomSheet
      {...props}
      contentPadding={padding}
      showDragIndicator={showDragIndicator}
      snapPoints={snapPoints}
      containerColor={containerColor ?? colors.surface.background.primary}
    >
      <RNHostView matchContents={fitToContents}>
        <View
          collapsable={false}
          style={[
            styles.content,
            fitToContents
              ? { width: Math.max(0, width - horizontalPadding) }
              : styles.fillContent,
          ]}
        >
          {children}
        </View>
      </RNHostView>
    </ExpoBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { width: '100%' },
  fillContent: { flexGrow: 1, height: 0 },
});

/** Adapts Luna picker visibility props to the native sheet component. */
function DateRangeBottomSheet({
  visible,
  onDismiss,
  children,
  snapPoints,
}: Readonly<DateRangeSheetProps>) {
  return (
    <BottomSheet
      isPresented={visible}
      onDismiss={onDismiss}
      snapPoints={snapPoints}
      contentPadding={0}
    >
      {children}
    </BottomSheet>
  );
}

function renderDateRangeBottomSheet(props: DateRangeSheetProps) {
  return <DateRangeBottomSheet {...props} />;
}

/** Installs the Expo sheet adapter required by Luna's sheet-based pickers. */
export function LunaBottomSheetProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <DateRangeSheetProvider sheet={renderDateRangeBottomSheet}>
      {children}
    </DateRangeSheetProvider>
  );
}
