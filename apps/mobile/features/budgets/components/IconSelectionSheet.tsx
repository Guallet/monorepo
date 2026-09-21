import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@guallet/luna-mobile';
import {
  CategoryIcon,
  selectableCategoryIconNames,
} from '@guallet/luna-mobile/icons';
import { BottomSheet } from '@/components/ui/BottomSheet';

interface IconSelectionSheetProps {
  selectedIcon: string;
  visible: boolean;
  onSelect: (icon: string) => void;
  onDismiss: () => void;
}

export function IconSelectionSheet({
  selectedIcon,
  visible,
  onSelect,
  onDismiss,
}: Readonly<IconSelectionSheetProps>) {
  const { colors, spacing, typography } = useTheme();
  const [draftIcon, setDraftIcon] = useState(selectedIcon);

  useEffect(() => {
    if (visible) setDraftIcon(selectedIcon);
  }, [selectedIcon, visible]);

  return (
    <BottomSheet
      isPresented={visible}
      onDismiss={onDismiss}
      snapPoints={['half']}
      testID="budget-icon-selection-sheet"
    >
      <View style={styles.sheet}>
        <View style={[styles.header, { marginBottom: spacing.md }]}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              fontWeight: '700',
            }}
          >
            Select an icon
          </Text>
          <Pressable accessibilityRole="button" onPress={onDismiss}>
            <Text
              style={{
                color: colors.accent.primary,
                fontSize: typography.sizes.sm,
              }}
            >
              Close
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {selectableCategoryIconNames.map((iconName) => {
            const selected = draftIcon === iconName;
            return (
              <Pressable
                key={iconName}
                accessibilityLabel={iconName}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => {
                  setDraftIcon(iconName);
                  onSelect(iconName);
                  onDismiss();
                }}
                style={({ pressed }) => [
                  styles.iconButton,
                  {
                    backgroundColor: selected
                      ? colors.button.secondary.default
                      : colors.surface.background.primary,
                    borderColor: selected
                      ? colors.accent.primary
                      : colors.surface.border.primary,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <CategoryIcon
                  color={colors.text.primary}
                  name={iconName}
                  size={24}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 16,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
});
