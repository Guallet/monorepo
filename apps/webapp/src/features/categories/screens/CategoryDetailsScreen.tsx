import { DeleteButton } from "@/components/Buttons/DeleteButton";
import { AppSection } from "@/components/Cards/AppSection";
import { GualletIcon } from "@/components/GualletIcon/GualletIcon";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import { useGroupedCategory, useCategoryMutations } from "@guallet/api-react";
import { Stack, Button, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import { CategoryRow } from "../components/CategoryRow/CategoryRow";

interface AppCategoryRowProps {
  categoryId: string;
}

export function CategoriesScreen({
  categoryId,
}: Readonly<AppCategoryRowProps>) {
  const navigation = useNavigate();
  const { category, isLoading } = useGroupedCategory(categoryId);
  const { deleteCategoryMutation } = useCategoryMutations();

  const isParent =
    category?.parentId === null || category?.parentId === undefined;

  const onDeleteCategory = async () => {
    if (category) {
      deleteCategoryMutation.mutate(
        {
          id: category.id,
        },
        {
          onSuccess: async (data, variables) => {
            notifications.show({
              title: "Category deleted",
              message: `Category has been deleted`,
              color: "green",
            });
            if (isParent) {
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
    <BaseScreen isLoading={isLoading}>
      <Stack>
        <AppSection>
          <Stack align="center">
            <GualletIcon
              iconName={category?.icon ?? "question"}
              iconColor={category?.colour ?? "black"}
            />
            <Text>{category?.name}</Text>
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
                    search: { parent: categoryId },
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
                  params: { id: categoryId },
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
    </BaseScreen>
  );
}
