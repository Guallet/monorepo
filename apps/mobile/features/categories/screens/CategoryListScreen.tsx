import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCategories } from '@guallet/api-react';
import { Button, TextInput, useTheme } from '@guallet/luna-mobile';
import { CheckIcon, CloseIcon } from '@guallet/luna-mobile/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { buildCategoryPickerTree } from '@/components/category-picker/categoryPicker.utils';
import { useCategoryFeedback } from '../CategoryFeedback';
import {
  CategoryCard,
  CategoryState,
  CategoryText,
} from '../components/CategoryUi';
import { CategoryManagementRow } from '../components/CategoryManagementRow';

export default function CategoryListScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { categories, isLoading, isError, isRefetching, refetch } =
    useCategories();
  const { feedback, setFeedback } = useCategoryFeedback();
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const list = useRef<ScrollView>(null);
  const groupOffsets = useRef(new Map<string, number>());
  const tree = useMemo(
    () => buildCategoryPickerTree(categories, query),
    [categories, query],
  );

  useEffect(() => {
    if (!feedback) return;
    if (feedback.categoryId) {
      setQuery('');
      if (feedback.parentId) {
        const parentId = feedback.parentId;
        setExpandedIds((current) => [...new Set([...current, parentId])]);
      }
      const targetId = feedback.parentId || feedback.categoryId;
      const frame = requestAnimationFrame(() => {
        const offset = groupOffsets.current.get(targetId);
        if (offset !== undefined)
          list.current?.scrollTo({ y: offset, animated: true });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [feedback]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 6000);
    return () => clearTimeout(timer);
  }, [feedback, setFeedback]);

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
        ref={list}
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
        {feedback && (
          <View
            accessibilityLiveRegion="polite"
            style={[
              styles.notice,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.support.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.sm,
                gap: spacing.sm,
              },
            ]}
          >
            <CheckIcon color={colors.support.primary} size={spacing.lg} />
            <Text
              style={{
                flex: 1,
                color: colors.text.primary,
                fontSize: typography.sizes.md,
              }}
            >
              {feedback.message}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss confirmation"
              onPress={() => setFeedback(null)}
              style={styles.dismiss}
            >
              <CloseIcon color={colors.text.secondary} size={spacing.lg} />
            </Pressable>
          </View>
        )}
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
              <View
                key={category.id}
                onLayout={(event) => {
                  const offset = event.nativeEvent.layout.y;
                  groupOffsets.current.set(category.id, offset);
                  if (
                    feedback?.categoryId &&
                    (feedback.parentId || feedback.categoryId) === category.id
                  ) {
                    list.current?.scrollTo({ y: offset, animated: true });
                  }
                }}
              >
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

const styles = StyleSheet.create({
  notice: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  dismiss: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
