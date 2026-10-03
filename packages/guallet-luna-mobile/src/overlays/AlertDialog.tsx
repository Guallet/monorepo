import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

export interface AlertAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertOptions {
  title: string;
  message?: string;
  actions?: ReadonlyArray<AlertAction>;
}

interface AlertContextValue {
  alert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

/** Shows themed, accessible alerts above the app's current screen. */
export function AlertProvider({ children }: Readonly<PropsWithChildren>) {
  const [options, setOptions] = useState<AlertOptions | null>(null);
  const alert = useCallback((next: AlertOptions) => setOptions(next), []);
  const dismiss = useCallback(() => setOptions(null), []);

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}
      <AlertDialog options={options} onDismiss={dismiss} />
    </AlertContext.Provider>
  );
}

/** Access the app-level alert presenter. */
export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context.alert;
}

function AlertDialog({
  options,
  onDismiss,
}: Readonly<{
  options: AlertOptions | null;
  onDismiss: () => void;
}>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const [pressedActionIndex, setPressedActionIndex] = useState<number | null>(
    null,
  );
  const defaultAction: AlertAction = { text: 'OK' };
  const actions = options?.actions?.length ? options.actions : [defaultAction];
  const sideBySide = actions.length === 2;

  const handleAction = (action: AlertAction) => {
    onDismiss();
    action.onPress?.();
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
      transparent
      visible={options !== null}
    >
      <View
        accessibilityViewIsModal
        style={[
          styles.backdrop,
          { backgroundColor: colors.surface.overlay, padding: spacing.lg },
        ]}
      >
        <View
          accessibilityLiveRegion="assertive"
          accessibilityRole="alert"
          style={[
            styles.dialog,
            {
              backgroundColor: colors.surface.background.primary,
              borderColor: colors.surface.border.primary,
              borderRadius: borderRadius.lg,
              shadowColor: colors.neutral.black,
              padding: spacing.lg,
              gap: spacing.md,
            },
          ]}
        >
          <View style={{ gap: spacing.xs }}>
            <Text
              accessibilityRole="header"
              style={[
                styles.title,
                { color: colors.text.primary, fontSize: typography.sizes.lg },
              ]}
            >
              {options?.title}
            </Text>
            {options?.message ? (
              <Text
                style={[
                  styles.message,
                  {
                    color: colors.text.secondary,
                    fontSize: typography.sizes.md,
                  },
                ]}
              >
                {options.message}
              </Text>
            ) : null}
          </View>
          <View
            style={[
              styles.actions,
              !sideBySide && styles.stackedActions,
              { gap: spacing.sm },
            ]}
          >
            {actions.map((action, index) => {
              const destructive = action.style === 'destructive';
              const cancel = action.style === 'cancel';
              const isPressed = pressedActionIndex === index;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={`${action.text}-${index}`}
                  onPress={() => handleAction(action)}
                  onPressIn={() => setPressedActionIndex(index)}
                  onPressOut={() => setPressedActionIndex(null)}
                  style={({ pressed }) => [
                    styles.action,
                    {
                      backgroundColor: getActionBackgroundColor(
                        pressed,
                        destructive,
                        cancel,
                        colors,
                      ),
                      borderRadius: borderRadius.md,
                      minHeight: typography.sizes.md + spacing.md * 2,
                      paddingHorizontal: spacing.md,
                      flex: sideBySide ? 1 : undefined,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.actionLabel,
                      {
                        color: getActionTextColor(
                          isPressed,
                          destructive,
                          cancel,
                          colors,
                        ),
                        fontSize: typography.sizes.md,
                      },
                    ]}
                  >
                    {action.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    width: '100%',
    maxWidth: 440,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 18,
  },
  title: { fontWeight: '600' },
  message: { lineHeight: 24 },
  actions: { flexDirection: 'row' },
  stackedActions: { flexDirection: 'column' },
  action: { alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontWeight: '500', textAlign: 'center' },
});

function getActionBackgroundColor(
  pressed: boolean,
  destructive: boolean,
  cancel: boolean,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  if (destructive) {
    return pressed ? colors.status.error : colors.surface.background.error;
  }
  if (cancel) {
    if (pressed) return colors.button.secondary.pressed;
    return colors.button.secondary.default;
  }
  if (pressed) return colors.button.primary.pressed;
  return colors.button.primary.default;
}

function getActionTextColor(
  pressed: boolean,
  destructive: boolean,
  cancel: boolean,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  if (destructive) return pressed ? colors.neutral.white : colors.status.error;
  if (cancel) return colors.text.primary;
  return colors.button.onPrimary.default;
}
