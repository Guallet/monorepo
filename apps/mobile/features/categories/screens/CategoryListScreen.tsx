import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useGroupedCategories, AppCategory } from '@guallet/api-react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, EmptyState, useTheme } from '@luna-ui/react-native';
import { useRouter } from 'expo-router';

function CategoryRow({ category, isSubcategory = false }: { category: AppCategory; isSubcategory?: boolean }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.categoryRow, isSubcategory && styles.subcategoryRow]}>
      <Avatar
        size={32}
        color={category.colour || '#E5E7EB'}
        label={category.icon || category.name.charAt(0)}
      />
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
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <AppScreen
        headerTitle="Categories"
        isLoading={isLoading}
        headerOptions={{
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/category/new')}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>+</Text>
            </TouchableOpacity>
          ),
        }}
      >
        {categories.length === 0 && !isLoading ? (
          <EmptyState
            title="No categories yet"
            message="Categories help you organize your transactions."
          />
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
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  headerButtonText: {
    fontSize: 28,
    color: '#007AFF',
    fontWeight: '400',
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
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
});
