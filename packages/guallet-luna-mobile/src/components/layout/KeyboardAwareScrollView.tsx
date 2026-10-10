import { forwardRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import {
  KeyboardAwareScrollView as ControllerScrollView,
  type KeyboardAwareScrollViewProps,
  type KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller';
import { useTheme } from '../../theme';

export type { KeyboardAwareScrollViewProps, KeyboardAwareScrollViewRef };

/** Keyboard adjustment belongs here; device safe areas belong to the screen. */
export const KeyboardAwareScrollView = forwardRef<
  KeyboardAwareScrollViewRef,
  KeyboardAwareScrollViewProps
>(function KeyboardAwareScrollView(
  { style, contentContainerStyle, ...props },
  ref,
) {
  const { spacing } = useTheme();

  return (
    <ControllerScrollView
      ref={ref}
      bottomOffset={spacing.md}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      {...props}
      automaticallyAdjustKeyboardInsets={false}
      contentInsetAdjustmentBehavior="never"
      style={[styles.scroll, style]}
      contentContainerStyle={[styles.content, contentContainerStyle]}
    />
  );
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { flexGrow: 1 },
});
