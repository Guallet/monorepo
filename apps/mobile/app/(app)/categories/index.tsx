import {
  useCategories,
  useGroupedCategories,
} from "@/features/categories/useCategories";
import { CategoryDto } from "@guallet/api-client";
import { Icon, Label, Spacing } from "@guallet/ui-react-native";
import { Stack } from "expo-router";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

export default function CategoriesScreen() {
  const { categories, isLoading } = useGroupedCategories();

  return (
    <View>
      <Stack.Screen
        options={{
          title: "Categories",
        }}
      />
      {/* <Label>{JSON.stringify(categories, null, 2)}</Label> */}
      <FlatList
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        data={categories}
        renderItem={({ item }) => (
          <CategoryRow
            category={item}
            onClick={(category) => {
              console.log("Clicked category", category);
            }}
          />
        )}
        ListEmptyComponent={<Label>Create your first category</Label>}
      />
    </View>
  );
}

interface CategoryRowProps {
  category: CategoryDto;
  onClick?: (category: CategoryDto) => void;
}
function CategoryRow({ category }: CategoryRowProps) {
  return (
    <View
      style={{
        height: 50,
        padding: Spacing.medium,
        flexDirection: "row",
        flex: 1,
        gap: Spacing.small,
        backgroundColor: "green",
        borderWidth: 1,
      }}
    >
      {/* <Icon name={category.icon} size={24} /> */}

      <Icon name={"coins"} size={24} />
      <Label style={{ flexGrow: 1, backgroundColor: "red" }}>
        {category.name}
      </Label>
    </View>
  );
}
