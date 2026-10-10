import { useLayoutEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme, BottomSheet } from '@guallet/luna-mobile';

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
  onSelect: (id: string | null) => void;
}

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
  const closeNotified = useRef(false);

  useLayoutEffect(() => {
    if (visible) closeNotified.current = false;
  }, [visible]);

  function notifyClose() {
    if (closeNotified.current) return;
    closeNotified.current = true;
    onClose();
  }

  function handleSelect(id: string | null) {
    onSelect(id);
    notifyClose();
  }

  return (
    <BottomSheet
      contentPadding={0}
      isOpen={visible}
      title={title}
      showCloseIcon
      onClose={notifyClose}
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
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        {
          borderBottomColor: colors.surface.border.primary,
          opacity: pressed ? 0.7 : 1,
          paddingVertical: spacing.md,
        },
      ]}
    >
      <Text
        style={{ color: colors.text.primary, fontSize: typography.sizes.md }}
        numberOfLines={1}
      >
        {label}
      </Text>
      {selected && (
        <Text
          style={{
            color: colors.accent.primary,
            fontSize: typography.sizes.lg,
          }}
        >
          ✓
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
  },
  option: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
