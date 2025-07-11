import { CategoryRow } from "@/components/Categories/CategoryRow";
import { AppScreen } from "@/components/layout/AppScreen";
import { CategoryDto } from "@guallet/api-client";
import { AppCategory, useGroupedCategories } from "@guallet/api-react";
import { Label, PrimaryButton, Spacing } from "@guallet/ui-react-native";
import { Stack, router } from "expo-router";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

export default function CategoriesScreen() {
  const { categories, isLoading } = useGroupedCategories();

  return (
    <AppScreen isLoading={isLoading}>
      <View style={{ flex: 1 }}>
        <Stack.Screen
          options={{
            title: "Categories",
            headerTitleAlign: "center",
          }}
        />

        <View
          style={{
            flex: 1,
            flexDirection: "column",
            paddingHorizontal: Spacing.medium,
            paddingTop: Spacing.small,
          }}
        >
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
              paddingVertical: Spacing.medium,
              flexGrow: 1,
            }}
          >
            <PrimaryButton title="Create category" />
          </View>
        </View>
      </View>
    </AppScreen>
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
      style={{
        backgroundColor: "white",
        borderRadius: Spacing.small,
      }}
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
