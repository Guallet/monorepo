import {
  BottomSheet as ExpoBottomSheet,
  RNHostView,
  type BottomSheetProps as ExpoBottomSheetProps,
} from '@expo/ui';
import { useContext, useId, useLayoutEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '../theme';
import { CloseIcon } from '../icons';
import { ToastQueueContext } from './ToastContext';
import { SheetToastPresence } from './SheetToastPresence';

export interface BottomSheetProps extends Omit<
  ExpoBottomSheetProps,
  'isPresented' | 'onDismiss'
> {
  isOpen: boolean;
  title: string;
  onClose?: () => void;
  /** Show a close button in the sheet header. Defaults to false. */
  showCloseIcon?: boolean;
}

export function BottomSheet({
  children,
  isOpen,
  title,
  showCloseIcon = false,
  onClose,
  containerColor,
  contentPadding,
  showDragIndicator = true,
  snapPoints,
  ...props
}: Readonly<BottomSheetProps>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { width } = useWindowDimensions();
  const queue = useContext(ToastQueueContext);
  const sheetId = useId();

  // Block before the native content mounts. Only its eventual unmount releases
  // the block, including programmatic closes that do not call onDismiss.
  useLayoutEffect(() => {
    if (isOpen) queue?.block(sheetId);
  }, [isOpen, queue, sheetId]);
  useLayoutEffect(() => () => queue?.release(sheetId), [queue, sheetId]);

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
      onDismiss={() => {
        onClose?.();
      }}
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
          <SheetToastPresence sheetId={sheetId} />
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
                onPress={onClose}
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
