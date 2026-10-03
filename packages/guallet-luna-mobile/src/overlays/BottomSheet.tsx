import {
  BottomSheet as ExpoBottomSheet,
  RNHostView,
  type BottomSheetProps as ExpoBottomSheetProps,
} from '@expo/ui';
import { type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  DateRangeSheetProvider,
  type DateRangeSheetProps,
} from '../components/inputs/DateRangePicker/DateRangeSheetProvider';
import { useTheme } from '../theme';
import { CloseIcon } from '../icons';

export interface BottomSheetProps extends Omit<
  ExpoBottomSheetProps,
  'isPresented'
> {
  isOpen: boolean;
  title: string;
  /** Called when the close button is pressed or the user dismisses the sheet. */
  onClose?: () => void;
  /** Show a close button in the sheet header. Defaults to false. */
  showCloseIcon?: boolean;
}

/** Theme-aware wrapper around Expo's universal bottom sheet. */
export function BottomSheet({
  children,
  isOpen,
  title,
  showCloseIcon = false,
  onDismiss,
  onClose,
  containerColor,
  contentPadding,
  showDragIndicator = true,
  snapPoints,
  ...props
}: Readonly<BottomSheetProps>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
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
      isPresented={isOpen}
      onDismiss={onDismiss}
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
          <View
            style={[
              styles.header,
              {
                gap: spacing.sm,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              },
            ]}
          >
            <Text
              accessibilityRole="header"
              style={[
                styles.title,
                { color: colors.text.primary, fontSize: typography.sizes.lg },
              ]}
            >
              {title}
            </Text>
            {showCloseIcon && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close bottom sheet"
                onPress={() => {
                  onClose?.();
                }}
                style={({ pressed }) => [
                  styles.closeButton,
                  {
                    minHeight: spacing.xxl + spacing.xs,
                    minWidth: spacing.xxl + spacing.xs,
                    borderRadius: borderRadius.xl,
                    backgroundColor: pressed
                      ? colors.surface.background.secondary
                      : colors.surface.background.primary,
                  },
                ]}
              >
                <CloseIcon
                  size={spacing.lg}
                  color={colors.text.secondary}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              </Pressable>
            )}
          </View>
          <View style={!fitToContents && styles.fillContent}>{children}</View>
        </View>
      </RNHostView>
    </ExpoBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { width: '100%' },
  fillContent: { flexGrow: 1, height: 0 },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1, fontWeight: '600' },
  closeButton: { alignItems: 'center', justifyContent: 'center' },
});

/** Adapts Luna picker visibility props to the native sheet component. */
function DateRangeBottomSheet({
  visible,
  title,
  showCloseIcon,
  onDismiss,
  children,
  snapPoints,
}: Readonly<DateRangeSheetProps>) {
  return (
    <BottomSheet
      isOpen={visible}
      title={title}
      showCloseIcon={showCloseIcon}
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
