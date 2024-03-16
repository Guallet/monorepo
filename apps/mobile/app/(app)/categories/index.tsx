import { CategoryRow } from "@/components/Categories/CategoryRow";
import {
  AppCategory,
  useGroupedCategories,
} from "@/features/categories/useCategories";
import { CategoryDto } from "@guallet/api-client";
import { Label, PrimaryButton, Spacing } from "@guallet/ui-react-native";
import { Stack, router } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

export default function CategoriesScreen() {
  const { categories, isLoading } = useGroupedCategories();

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Categories",
          headerTitleAlign: "center",
        }}
      />
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        // <CategoriesList
        //   onCategorySelected={(category) => {
        //     console.log("Selected category", category);
        //   }}
        // />
        <View style={{ flex: 1, flexDirection: "column" }}>
          <RootCategoriesList
            categories={categories}
            onCategorySelected={(category) => {
              router.navigate({
                pathname: `/categories/${category.id}`,
              });
            }}
          />
          <View
            style={{
              alignContent: "flex-end",
              justifyContent: "flex-end",
              padding: Spacing.medium,
              flexGrow: 1,
            }}
          >
            <PrimaryButton title="Create category" />
          </View>
        </View>
      )}
    </View>
  );
}

interface RootCategoriesListProps {
  categories: AppCategory[];
  onCategorySelected: (category: AppCategory | CategoryDto) => void;
}
export function RootCategoriesList({
  categories,
  onCategorySelected,
}: RootCategoriesListProps) {
  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      data={categories}
      renderItem={({ item }) => (
        <CategoryRow
          category={item}
          onClick={(category) => {
            onCategorySelected(category);
          }}
        />
      )}
      ListEmptyComponent={<Label>Create your first category</Label>}
    />
  );
}
