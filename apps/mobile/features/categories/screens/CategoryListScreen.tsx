import { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useGroupedCategories, AppCategory } from '@guallet/api-react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Label, Title, useTheme } from '@luna-ui/react-native';

function CategoryRow({ category, isSubcategory = false }: { category: AppCategory; isSubcategory?: boolean }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.categoryRow, isSubcategory && styles.subcategoryRow]}>
      <View
        style={[
          styles.categoryIcon,
          { backgroundColor: category.colour || '#E5E7EB' },
        ]}
      >
        <Text style={styles.categoryIconText}>
          {category.icon || category.name.charAt(0)}
        </Text>
      </View>
      <Text style={[styles.categoryName, { color: colors.text }]}>
        {category.name}
      </Text>
    </View>
  );
}

function CategorySection({ category }: { category: AppCategory }) {
  return (
    <View style={styles.section}>
      <CategoryRow category={category} />
      {category.subCategories.map((sub) => (
        <CategoryRow key={sub.id} category={sub} isSubcategory />
      ))}
    </View>
  );
}

export function CategoryListScreen() {
  const { categories, isLoading } = useGroupedCategories();

  return (
    <SafeAreaView style={styles.container}>
      <AppScreen headerTitle="Categories" isLoading={isLoading}>
        {categories.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <Title>No categories yet</Title>
            <Label center>
              Categories help you organize your transactions.
            </Label>
          </View>
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CategorySection category={item} />}
          />
        )}
      </AppScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  section: {
    marginBottom: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  subcategoryRow: {
    paddingLeft: 44,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
});
