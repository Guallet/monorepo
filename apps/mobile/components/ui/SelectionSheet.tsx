import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme, BottomSheet } from '@guallet/luna-mobile';
import { CheckIcon } from '@guallet/luna-mobile/icons';

export type SelectionOption = {
  id: string;
  label: string;
};

interface SelectionSheetProps {
  visible: boolean;
  title: string;
  options: SelectionOption[];
  selectedId: string | null;
  allowNone?: boolean;
  noneLabel?: string;
  onClose: () => void;
  /** Called before immediate dismissal; the caller owns async saves and errors. */
  onSelect: (id: string | null) => void;
}

/** Present single-choice options and dismiss immediately after selection. */
export function SelectionSheet({
  visible,
  title,
  options,
  selectedId,
  allowNone = false,
  noneLabel = 'None',
  onClose,
  onSelect,
}: Readonly<SelectionSheetProps>) {
  const { colors, spacing } = useTheme();

  /** Selection does not await persistence; dismissal is independent of saving. */
  function handleSelect(id: string | null) {
    onSelect(id);
    onClose();
  }

  return (
    <BottomSheet
      contentPadding={0}
      isOpen={visible}
      title={title}
      showCloseIcon
      onClose={onClose}
      snapPoints={['full']}
    >
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface.background.primary,
            padding: spacing.lg,
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {allowNone && (
            <OptionRow
              label={noneLabel}
              selected={selectedId === null}
              onPress={() => handleSelect(null)}
            />
          )}
          {options.map((option) => (
            <OptionRow
              key={option.id}
              label={option.label}
              selected={selectedId === option.id}
              onPress={() => handleSelect(option.id)}
            />
          ))}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

/** Expose each option as a radio control with a decorative selection icon. */
function OptionRow({
  label,
  selected,
  onPress,
}: Readonly<{
  label: string;
  selected: boolean;
  onPress: () => void;
}>) {
  const { colors, spacing, typography } = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        {
          borderBottomColor: colors.surface.border.primary,
          opacity: pressed ? 0.7 : 1,
          paddingVertical: spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: colors.text.primary, fontSize: typography.sizes.md },
        ]}
      >
        {label}
      </Text>
      {selected && (
        <CheckIcon
          size={spacing.lg}
          color={colors.accent.primary}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
  },
  label: { flex: 1 },
  option: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
