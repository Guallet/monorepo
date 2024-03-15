import {
  AppCategory,
  useGroupedCategories,
} from "@/features/categories/useCategories";
import React, { useState } from "react";
import { FlatList } from "react-native";
import { CategoryRow } from "./CategoryRow";
import { CategoryDto } from "@guallet/api-client";
import { ActionIcon, Label, Spacing } from "@guallet/ui-react-native";
import { View } from "../Themed";

interface CategoryListProps {
  onCategorySelected: (category: CategoryDto | AppCategory) => void;
}

// Maybe use this in the future? https://github.com/SimformSolutionsPvtLtd/react-native-tree-selection
export function CategoriesList({ onCategorySelected }: CategoryListProps) {
  const { categories, isLoading } = useGroupedCategories();

  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      data={categories}
      renderItem={({ item }) => <RootCategoryRow category={item} />}
      ListEmptyComponent={<Label>Create your first category</Label>}
    />
  );
}

interface CategoryRowProps {
  category: AppCategory;
}
export function RootCategoryRow({ category }: CategoryRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View
      style={{
        flexDirection: "column",
        flexGrow: 1,
      }}
    >
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <CategoryRow category={category} style={{ flexGrow: 1 }} />
        <ActionIcon
          style={{
            paddingHorizontal: Spacing.medium,
          }}
          name={isExpanded ? "chevron-down" : "chevron-right"}
          size={24}
          onClick={() => setIsExpanded(!isExpanded)}
        />
      </View>
      {isExpanded && (
        <FlatList
          data={category.subCategories.sort((a, b) =>
            a.name.localeCompare(b.name)
          )}
          renderItem={({ item }) => <SubCategoryRow category={item} />}
        />
      )}
    </View>
  );
}

export function SubCategoryRow({ category }: CategoryRowProps) {
  return (
    <CategoryRow
      category={category}
      style={{
        // TODO: This is because the spacing values are not being defined
        // Blame the designed, a.k.a me ;-)
        paddingLeft: Spacing.medium * 2 + Spacing.small,
      }}
    />
  );
}
