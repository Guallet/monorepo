import type { CategoryPickerItem } from '@/components/category-picker/categoryPicker.utils';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@guallet/luna-mobile';
import {
  CategoryIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EditIcon,
} from '@guallet/luna-mobile/icons';

export function CategoryManagementRow({
  category,
  expanded,
  onToggle,
  onEdit,
  child = false,
}: Readonly<{
  category: CategoryPickerItem;
  expanded?: boolean;
  onToggle?: () => void;
  onEdit: () => void;
  child?: boolean;
}>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  let expandIcon = (
    <ChevronRightIcon color={colors.text.secondary} size={spacing.lg} />
  );
  if (expanded)
    expandIcon = (
      <ChevronDownIcon color={colors.text.secondary} size={spacing.lg} />
    );
  let indent = 0;
  if (child) indent = spacing.xl;
  return (
    <View
      style={[
        styles.row,
        {
          paddingLeft: indent,
          borderBottomColor: colors.surface.border.primary,
        },
      ]}
    >
      {onToggle && (
        <Pressable
          accessibilityLabel={`Expand or collapse ${category.name}`}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          onPress={onToggle}
          style={styles.iconButton}
        >
          {expandIcon}
        </Pressable>
      )}
      <Pressable
        accessibilityLabel={`Edit ${category.name}`}
        accessibilityRole="button"
        onPress={onEdit}
        style={[
          styles.editArea,
          { gap: spacing.sm, paddingVertical: spacing.md },
        ]}
      >
        <CategoryIcon
          name={category.icon}
          color={category.colour ?? colors.accent.primary}
          size={spacing.lg}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <Text
          style={{
            flex: 1,
            color: colors.text.primary,
            fontSize: typography.sizes.md,
          }}
        >
          {category.name}
        </Text>
      </Pressable>
      <Pressable
        accessibilityLabel={`Edit ${category.name}`}
        accessibilityRole="button"
        onPress={onEdit}
        style={[styles.iconButton, { borderRadius: borderRadius.md }]}
      >
        <EditIcon color={colors.accent.primary} size={spacing.lg} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  editArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
