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
import { RootCategoriesList } from ".";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { CategoryDto } from "@guallet/api-client";
import { CategoryColourPicker } from "@/components/Categories/CategoryColourPicker";
import { useState } from "react";
import Colors from "@/constants/Colors";

export default function CategoryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { category, isLoading } = useGroupedCategory(id);

  const [colour, setColour] = useState(category?.colour ?? "#000000");

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
            <IconHeader
              category={category}
              colour={colour}
              onClick={(category: CategoryDto | AppCategory) => {
                console.log("Edit category icon", category);
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
                  {/* <PrimaryButton
                    title="+"
                    style={{
                      flexGrow: 1,
                      maxWidth: 50,
                    }}
                  /> */}
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

interface IconHeaderProps {
  category: AppCategory | CategoryDto;
  colour: string;
  onClick: (category: AppCategory | CategoryDto) => void;
}
function IconHeader({ category, colour, onClick }: IconHeaderProps) {
  return (
    <TouchableOpacity
      onPress={() => {
        onClick(category);
      }}
      style={{
        borderRadius: 50,
        height: 100,
        width: 100,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
      }}
    >
      <CategoryIcon name={category.icon} color={colour} size={50} />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          end: -Spacing.medium,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 50,
          backgroundColor: "#ececec",
          height: 30,
          width: 30,
        }}
      >
        <Icon name="pencil" size={20} />
      </View>
    </TouchableOpacity>
  );
}
