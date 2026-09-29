import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@guallet/luna-mobile';
import { CheckIcon, ChevronDownIcon } from '@guallet/luna-mobile/icons';
import { BottomSheet } from '@/components/ui/BottomSheet';

export interface Choice {
  value: string;
  label: string;
}

interface Props {
  label: string;
  value: string;
  options: Choice[];
  onChange: (value: string) => void;
  sample?: string;
}

export function ChoiceField({
  label,
  value,
  options,
  onChange,
  sample,
}: Readonly<Props>) {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const [visible, setVisible] = useState(false);
  const selected =
    options.find((option) => option.value === value)?.label ??
    'Select a column';
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text
        style={[
          styles.label,
          {
            color: colors.text.primary,
            fontSize: typography.sizes.sm,
            marginBottom: spacing.xs,
          },
        ]}
      >
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected}`}
        accessibilityState={{ expanded: visible }}
        onPress={() => setVisible(true)}
        style={[
          styles.choice,
          {
            borderColor: colors.surface.border.primary,
            borderRadius: borderRadius.md,
            padding: spacing.sm,
          },
        ]}
      >
        <Text
          style={{ color: colors.text.primary, fontSize: typography.sizes.sm }}
        >
          {selected}
        </Text>
        <ChevronDownIcon size={18} color={colors.text.secondary} />
      </Pressable>
      {sample && (
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.xs,
            marginTop: spacing.xs,
          }}
        >
          Example: {sample}
        </Text>
      )}
      <BottomSheet
        isPresented={visible}
        onDismiss={() => setVisible(false)}
        snapPoints={['half', 'full']}
      >
        <View style={{ padding: spacing.md }}>
          <Text
            style={[
              styles.sheetTitle,
              {
                color: colors.text.primary,
                fontSize: typography.sizes.lg,
                marginBottom: spacing.md,
              },
            ]}
          >
            {label}
          </Text>
          <ScrollView>
            {options.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityLabel={`Select ${option.label}`}
                accessibilityState={{ selected: option.value === value }}
                onPress={() => {
                  onChange(option.value);
                  setVisible(false);
                }}
                style={[
                  styles.option,
                  {
                    borderBottomColor: colors.surface.border.primary,
                    paddingVertical: spacing.md,
                  },
                ]}
              >
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: typography.sizes.md,
                  }}
                >
                  {option.label}
                </Text>
                {option.value === value && (
                  <CheckIcon size={20} color={colors.accent.primary} />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '600' },
  choice: {
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  sheetTitle: { fontWeight: '700' },
  option: {
    borderBottomWidth: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
