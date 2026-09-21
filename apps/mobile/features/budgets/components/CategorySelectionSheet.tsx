import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CategoryDto } from '@guallet/api-client';
import { TextInput, useTheme } from '@guallet/luna-mobile';
import { CategoryIcon } from '@guallet/luna-mobile/icons';
import { BottomSheet } from '@/components/ui/BottomSheet';

interface CategorySelectionSheetProps {
  categories: CategoryDto[];
  selectedIds: string[];
  visible: boolean;
  onApply: (categoryIds: string[]) => void;
  onDismiss: () => void;
}

export function CategorySelectionSheet({
  categories,
  selectedIds,
  visible,
  onApply,
  onDismiss,
}: Readonly<CategorySelectionSheetProps>) {
  const { colors, spacing, typography } = useTheme();
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (visible) {
      setDraftIds(selectedIds);
      setQuery('');
    }
  }, [selectedIds, visible]);

  const visibleCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return categories;

    const matching = categories.filter((category) =>
      category.name.toLowerCase().includes(normalizedQuery),
    );
    const parentIds = new Set(
      matching
        .map((category) => category.parentId)
        .filter((parentId): parentId is string => parentId !== null),
    );

    return categories.filter(
      (category) => matching.includes(category) || parentIds.has(category.id),
    );
  }, [categories, query]);

  const roots = visibleCategories.filter((category) => !category.parentId);
  const childrenByParent = new Map<string, CategoryDto[]>();
  visibleCategories.forEach((category) => {
    if (category.parentId) {
      const children = childrenByParent.get(category.parentId) ?? [];
      children.push(category);
      childrenByParent.set(category.parentId, children);
    }
  });

  function toggleCategory(id: string) {
    setDraftIds((current) =>
      current.includes(id)
        ? current.filter((categoryId) => categoryId !== id)
        : [...current, id],
    );
  }

  return (
    <BottomSheet
      isPresented={visible}
      onDismiss={onDismiss}
      snapPoints={['full']}
      testID="budget-category-selection-sheet"
    >
      <View style={styles.sheet}>
        <View style={[styles.header, { marginBottom: spacing.md }]}>
          <View style={styles.headerCopy}>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.lg,
                fontWeight: '700',
              }}
            >
              Select categories
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.sm,
              }}
            >
              Choose the categories this budget should track.
            </Text>
          </View>
          <Pressable accessibilityRole="button" onPress={onDismiss}>
            <Text
              style={{
                color: colors.accent.primary,
                fontSize: typography.sizes.sm,
                fontWeight: '600',
              }}
            >
              Close
            </Text>
          </Pressable>
        </View>

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          label="Search"
          onChangeText={setQuery}
          placeholder="Search categories"
          value={query}
        />

        <ScrollView
          contentContainerStyle={{ paddingBottom: spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          {roots.map((category) => (
            <View key={category.id}>
              <CategoryOption
                category={category}
                selected={draftIds.includes(category.id)}
                onPress={() => toggleCategory(category.id)}
              />
              {childrenByParent.get(category.id)?.map((child) => (
                <CategoryOption
                  key={child.id}
                  category={child}
                  indent
                  selected={draftIds.includes(child.id)}
                  onPress={() => toggleCategory(child.id)}
                />
              ))}
            </View>
          ))}
          {roots.length === 0 && (
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.sm,
              }}
            >
              No categories found.
            </Text>
          )}
        </ScrollView>

        <View
          style={[styles.actions, { gap: spacing.sm, marginTop: spacing.sm }]}
        >
          <Pressable
            onPress={onDismiss}
            style={[
              styles.action,
              { borderColor: colors.surface.border.primary },
            ]}
          >
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.md,
              }}
            >
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              onApply(draftIds);
              onDismiss();
            }}
            style={[styles.action, { backgroundColor: colors.accent.primary }]}
          >
            <Text
              style={{
                color: colors.button.onPrimary.default,
                fontSize: typography.sizes.md,
                fontWeight: '600',
              }}
            >
              Done ({draftIds.length})
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}

function CategoryOption({
  category,
  indent = false,
  selected,
  onPress,
}: Readonly<{
  category: CategoryDto;
  indent?: boolean;
  selected: boolean;
  onPress: () => void;
}>) {
  const { colors, spacing, typography } = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        {
          borderBottomColor: colors.surface.border.primary,
          opacity: pressed ? 0.7 : 1,
          paddingLeft: indent ? spacing.xl : spacing.sm,
          paddingVertical: spacing.sm,
        },
      ]}
    >
      <View style={[styles.optionCopy, { gap: spacing.sm }]}>
        <View
          style={[
            styles.icon,
            {
              backgroundColor:
                category.colour || colors.button.secondary.default,
              borderRadius: 16,
            },
          ]}
        >
          <CategoryIcon
            color={colors.neutral.white}
            name={category.icon}
            size={16}
          />
        </View>
        <Text
          style={{ color: colors.text.primary, fontSize: typography.sizes.md }}
        >
          {category.name}
        </Text>
      </View>
      <Text
        style={{
          color: selected ? colors.accent.primary : colors.text.secondary,
          fontSize: typography.sizes.lg,
        }}
      >
        {selected ? '✓' : '○'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  option: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionCopy: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  icon: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  actions: {
    flexDirection: 'row',
  },
  action: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
  },
});
