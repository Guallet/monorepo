import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCategories } from '@guallet/api-react';
import { Button, TextInput, useTheme } from '@guallet/luna-mobile';
import { AppScreen } from '@/components/layout/AppScreen';
import { buildCategoryPickerTree } from '@/components/category-picker/categoryPicker.utils';
import {
  CategoryCard,
  CategoryState,
  CategoryText,
} from '../components/CategoryUi';
import { CategoryManagementRow } from '../components/CategoryManagementRow';

export default function CategoryListScreen() {
  const { colors, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { categories, isLoading, isError, isRefetching, refetch } =
    useCategories();
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const tree = useMemo(
    () => buildCategoryPickerTree(categories, query),
    [categories, query],
  );

  function edit(id: string) {
    router.push({ pathname: '/categories/[id]', params: { id } });
  }
  function create(parent?: string) {
    router.push({ pathname: '/categories/new', params: { parent } });
  }
  function toggle(id: string) {
    setExpandedIds((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id);
      return [...current, id];
    });
  }

  return (
    <AppScreen
      headerTitle="Categories"
      headerOptions={{ headerBackTitle: 'Settings' }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.accent.primary}
          />
        }
      >
        <CategoryText secondary>Organise your transactions</CategoryText>
        <TextInput
          accessibilityLabel="Search categories"
          placeholder="Search categories"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
        {isLoading && (
          <View
            accessibilityLabel="Loading categories"
            accessibilityState={{ busy: true }}
            style={{ gap: spacing.md }}
          >
            {[0, 1, 2, 3].map((row) => (
              <View
                key={row}
                style={{
                  height: spacing.xxl + spacing.lg,
                  backgroundColor: colors.surface.background.secondary,
                  borderRadius: borderRadius.lg,
                }}
              />
            ))}
          </View>
        )}
        {isError && (
          <CategoryState
            title="Couldn’t load categories"
            body="Check your connection and try again."
            action="Try again"
            onAction={() => void refetch()}
          />
        )}
        {!isLoading && !isError && categories.length === 0 && (
          <CategoryState
            title="No categories yet"
            body="Create your first category to organise transactions."
          />
        )}
        {!isLoading &&
          !isError &&
          categories.length > 0 &&
          tree.length === 0 && (
            <CategoryState
              title="No categories found"
              action="Clear search"
              onAction={() => setQuery('')}
            />
          )}
        {!isLoading &&
          !isError &&
          tree.map(({ category, children }) => {
            const expanded =
              Boolean(query.trim()) || expandedIds.includes(category.id);
            return (
              <View key={category.id}>
                <CategoryCard>
                  <CategoryManagementRow
                    category={category}
                    expanded={expanded}
                    onToggle={() => toggle(category.id)}
                    onEdit={() => edit(category.id)}
                  />
                  {expanded && (
                    <View>
                      {children.map((child) => (
                        <CategoryManagementRow
                          key={child.id}
                          category={child}
                          child
                          onEdit={() => edit(child.id)}
                        />
                      ))}
                      <Button
                        variant="subtle"
                        accessibilityLabel={`Add subcategory to ${category.name}`}
                        onClick={() => create(category.id)}
                      >
                        Add subcategory
                      </Button>
                    </View>
                  )}
                </CategoryCard>
              </View>
            );
          })}
      </ScrollView>
      <View
        style={{
          padding: spacing.md,
          paddingBottom: Math.max(insets.bottom, spacing.md),
          backgroundColor: colors.surface.background.primary,
        }}
      >
        <Button onClick={() => create()}>Create category</Button>
      </View>
    </AppScreen>
  );
}
