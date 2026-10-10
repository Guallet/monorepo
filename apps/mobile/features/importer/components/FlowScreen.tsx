import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  KeyboardAwareScrollView,
  useTheme,
} from '@guallet/luna-mobile';
import { ChevronLeftIcon } from '@guallet/luna-mobile/icons';

interface Props {
  step?: number;
  navigationTitle: string;
  title: string;
  description: string;
  children: ReactNode;
  action: string;
  onAction: () => void;
  onBack: () => void;
  disabled?: boolean;
  busy?: boolean;
}

export function FlowScreen(props: Readonly<Props>) {
  const { colors, spacing, typography } = useTheme();
  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.surface.background.page }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface.background.primary,
            borderBottomColor: colors.surface.border.primary,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={props.onBack}
          style={styles.back}
        >
          <ChevronLeftIcon size={24} color={colors.accent.primary} />
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            { color: colors.text.primary, fontSize: typography.sizes.sm },
          ]}
        >
          {props.navigationTitle}
        </Text>
        <View style={styles.back} />
      </View>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {props.step && (
          <>
            <Text
              style={[
                styles.step,
                { color: colors.accent.primary, fontSize: typography.sizes.xs },
              ]}
            >
              Step {props.step} of 5
            </Text>
            <View
              style={[
                styles.progress,
                {
                  gap: spacing.xs,
                  marginTop: spacing.sm,
                  marginBottom: spacing.lg,
                },
              ]}
            >
              {[1, 2, 3, 4, 5].map((part) => (
                <View
                  key={part}
                  style={[
                    styles.progressPart,
                    {
                      backgroundColor:
                        part <= props.step!
                          ? colors.accent.primary
                          : colors.surface.border.primary,
                    },
                  ]}
                />
              ))}
            </View>
          </>
        )}
        <Text
          style={[
            styles.title,
            { color: colors.text.primary, fontSize: typography.sizes.xl },
          ]}
        >
          {props.title}
        </Text>
        <Text
          style={[
            styles.description,
            {
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
              marginBottom: spacing.lg,
            },
          ]}
        >
          {props.description}
        </Text>
        {props.children}

        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.surface.background.primary,
              borderTopColor: colors.surface.border.primary,
              padding: spacing.md,
            },
          ]}
        >
          <Button
            onClick={props.onAction}
            disabled={props.disabled || props.busy}
          >
            {props.busy ? 'Working…' : props.action}
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

export function ImportCard({ children }: Readonly<{ children: ReactNode }>) {
  const { colors, spacing, borderRadius } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.background.primary,
          borderColor: colors.surface.border.primary,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function Notice({
  children,
  warning = false,
}: Readonly<{ children: ReactNode; warning?: boolean }>) {
  const { colors, spacing, borderRadius } = useTheme();
  return (
    <View
      style={[
        styles.notice,
        {
          backgroundColor: warning
            ? colors.status.warning + '22'
            : colors.accent.primary + '12',
          borderRadius: borderRadius.md,
          padding: spacing.sm,
          marginBottom: spacing.md,
        },
      ]}
    >
      <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  back: {
    width: 40,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: { fontWeight: '700' },
  step: { fontWeight: '700' },
  progress: { flexDirection: 'row' },
  progressPart: { flex: 1, height: 4, borderRadius: 2 },
  title: { fontWeight: '700', letterSpacing: -0.4, marginBottom: 6 },
  description: { lineHeight: 20 },
  footer: { borderTopWidth: 1 },
  card: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  notice: {},
});
