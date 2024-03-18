import { CategoryIcon } from "@/components/Categories/CategoryIcon";
import { CategoryRow } from "@/components/Categories/CategoryRow";
import {
  AppCategory,
  useGroupedCategory,
} from "@/features/categories/useCategories";
import {
  ActionIcon,
  DangerButton,
  Divider,
  Icon,
  Label,
  PrimaryButton,
  Spacing,
  ValueRow,
} from "@guallet/ui-react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { FlatList, View } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { CategoryDto } from "@guallet/api-client";
import { CategoryColourPicker } from "@/components/Categories/CategoryColourPicker";
import { useState } from "react";
import { CategoryIconPicker } from "@/components/Categories/CategoryIconPicker";

export default function CategoryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { category, isLoading } = useGroupedCategory(id);

  const [colour, setColour] = useState(category?.colour ?? "#000000");
  const [icon, setIcon] = useState(category?.icon ?? null);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: category?.name ?? "Category details",
          headerTitleAlign: "center",
        }}
      />
      {isLoading && <Label>Loading...</Label>}
      {category && (
        <ScrollView
          style={{
            flex: 1,
            flexDirection: "column",
            paddingHorizontal: Spacing.medium,
            paddingTop: Spacing.medium,
          }}
        >
          {/* Main content */}
          <View
            style={{
              flexGrow: 1,
            }}
          >
            <CategoryIconPicker
              icon={icon ?? ""}
              colour={colour}
              onIconChange={(newIcon) => {
                setIcon(newIcon);
              }}
            />
            <ValueRow
              title="Name"
              value={category?.name ?? ""}
              showDivider={false}
            />

            <CategoryColourPicker
              colour={colour}
              onColourChange={(colour) => {
                setColour(colour);
              }}
            />

            {category.subCategories.length > 0 ? (
              <View
                style={{
                  paddingVertical: Spacing.medium,
                  backgroundColor: "white",
                  borderRadius: Spacing.small,
                  marginVertical: Spacing.medium,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Label
                    style={{ fontWeight: "bold", paddingStart: Spacing.small }}
                  >
                    Sub-categories
                  </Label>
                  <ActionIcon
                    name="plus"
                    color="white"
                    style={{
                      backgroundColor: "blue",
                      height: 40,
                      aspectRatio: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 50,
                    }}
                  />
                </View>
                <Divider />
                <FlatList
                  data={category.subCategories ?? []}
                  renderItem={({ item }) => (
                    <CategoryRow
                      category={item}
                      onClick={(subCategory) => {
                        router.navigate({
                          pathname: `/categories/${subCategory.id}`,
                        });
                      }}
                    />
                  )}
                  ListEmptyComponent={<Label>No sub-categories</Label>}
                />
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}
      {/* Bottom actions */}
      <View
        style={{
          alignContent: "flex-end",
          justifyContent: "flex-end",
          padding: Spacing.medium,
          gap: Spacing.small,
        }}
      >
        {/* {category?.parentId === null && (
          <PrimaryButton title="Create sub-category" />
        )} */}
        <DangerButton title="Delete category" />
      </View>
    </View>
  );
}
