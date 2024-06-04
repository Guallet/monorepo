import { DeleteButton } from "@/components/Buttons/DeleteButton";
import { AppSection } from "@/components/Cards/AppSection";
import { GualletIcon } from "@/components/GualletIcon/GualletIcon";
import { AppScreen } from "@/components/Layout/AppScreen";
import { CategoryRow } from "@/features/categories/components/CategoryRow/CategoryRow";
import { useCategoryMutations, useGroupedCategory } from "@guallet/api-react";
import { Stack, Button, Text, ColorInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/categories/$id")({
  component: CategoryDetailsPage,
});

function CategoryDetailsPage() {
  const { id } = Route.useParams();
  const navigation = useNavigate();
  const { category, isLoading } = useGroupedCategory(id);
  const { updateCategoryMutation } = useCategoryMutations();

  const [color, setColor] = useState<string>(category?.colour ?? "#25262b");

  useEffect(() => {
    setColor(category?.colour ?? "#25262b");
  }, [category]);

  const isParent =
    category?.parentId === null || category?.parentId === undefined;

  const onDeleteCategory = async () => {
    if (category) {
      updateCategoryMutation.mutate(
        {
          id: category.id,
          request: {
            name: category.name,
            icon: category.icon,
            colour: category.colour,
            parentId: null,
          },
        },
        {
          onSuccess: async (data, variables) => {
            notifications.show({
              title: "Category updated",
              message: `Category ${data.name} has been updated`,
              color: "green",
            });
            if (isParent && category.parentId !== null) {
              navigation({ to: "/categories" });
            } else {
              navigation({
                to: "/categories/$id",
                params: { id: category.parentId! },
              });
            }
          },
          onError: async (error, variables, context) => {
            console.error(error);
            notifications.show({
              title: "Error Category update",
              message: `Changes not saved: ${error.message}`,
              color: "red",
            });
          },
        }
      );
    }
  };

  return (
    <AppScreen isLoading={isLoading}>
      <Stack>
        <AppSection>
          <Stack align="center">
            {/* <CategoryIcon categoryId={category?.id ?? null} /> */}
            <GualletIcon
              iconName={category?.icon ?? "question"}
              iconColor={color}
            />
            <Text>{category?.name}</Text>
            <ColorInput
              readOnly
              closeOnColorSwatchClick
              label="Colour"
              placeholder="Select the category colour"
              value={color}
              onChange={(value) => setColor(value)}
              format="hex"
              swatches={[
                "#25262b",
                "#868e96",
                "#fa5252",
                "#e64980",
                "#be4bdb",
                "#7950f2",
                "#4c6ef5",
                "#228be6",
                "#15aabf",
                "#12b886",
                "#40c057",
                "#82c91e",
                "#fab005",
                "#fd7e14",
                "#fd7e14",
                "#fd7e14",
              ]}
            />
          </Stack>
        </AppSection>

        {isParent && (
          <Stack>
            <AppSection title="Sub-categories">
              {category?.subCategories.map((subCategory) => (
                <CategoryRow
                  key={subCategory.id}
                  category={subCategory}
                  onClick={() => {
                    navigation({
                      to: "/categories/$id",
                      params: { id: subCategory.id },
                    });
                  }}
                />
              ))}

              <Button
                variant="outline"
                onClick={() =>
                  navigation({
                    to: "/categories/new",
                    search: { parent: id },
                  })
                }
              >
                Add new sub category
              </Button>
            </AppSection>
          </Stack>
        )}

        <AppSection>
          <Stack>
            <Button
              onClick={() =>
                navigation({
                  to: "/categories/$id/edit",
                  params: { id },
                })
              }
            >
              Edit category
            </Button>
            <DeleteButton
              modalTitle="Delete category"
              modalMessage="Are you sure you want to delete this category?"
              onDelete={() => {
                onDeleteCategory();
              }}
            >
              Delete category
            </DeleteButton>
          </Stack>
        </AppSection>
      </Stack>
    </AppScreen>
  );
}
