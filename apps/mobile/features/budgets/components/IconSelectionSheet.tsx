import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme, BottomSheet } from '@guallet/luna-mobile';
import {
  CategoryIcon,
  selectableCategoryIconNames,
} from '@guallet/luna-mobile/icons';

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
  const { colors } = useTheme();
  const [draftIcon, setDraftIcon] = useState(selectedIcon);

  useEffect(() => {
    if (visible) setDraftIcon(selectedIcon);
  }, [selectedIcon, visible]);

  return (
    <BottomSheet
      isOpen={visible}
      title="Select an icon"
      showCloseIcon
      onClose={onDismiss}
      snapPoints={['half']}
      testID="budget-icon-selection-sheet"
    >
      <View style={styles.sheet}>
        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {selectableCategoryIconNames.map((iconName) => {
            const selected = draftIcon === iconName;
            let backgroundColor = colors.surface.background.primary;
            let borderColor = colors.surface.border.primary;
            if (selected) {
              backgroundColor = colors.button.secondary.default;
              borderColor = colors.accent.primary;
            }
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
                    backgroundColor,
                    borderColor,
                    opacity: getPressedOpacity(pressed),
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

function getPressedOpacity(pressed: boolean): number {
  if (pressed) return 0.7;
  return 1;
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
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
