import { CategoriesList } from "@/components/Categories/CategoriesList";
import {
  useCategories,
  useGroupedCategories,
} from "@/features/categories/useCategories";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function CategoriesScreen() {
  const { isLoading } = useGroupedCategories();

  return (
    <View>
      <Stack.Screen
        options={{
          title: "Categories",
          headerTitleAlign: "center",
        }}
      />
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <CategoriesList
          onCategorySelected={(category) => {
            console.log("Selected category", category);
          }}
        />
      )}
    </View>
  );
}
