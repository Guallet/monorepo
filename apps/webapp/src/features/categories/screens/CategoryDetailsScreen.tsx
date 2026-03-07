import { DeleteButton } from '@/components/Buttons/DeleteButton';
import { AppSection } from '@/components/Cards/AppSection';
import { GualletIcon } from '@/components/GualletIcon/GualletIcon';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { useGroupedCategory, useCategoryMutations } from '@guallet/api-react';
import { notifications } from '@/lib/notifications';
import { useNavigate } from '@tanstack/react-router';
import { CategoryRow } from '../components/CategoryRow/CategoryRow';

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
          onSuccess: () => {
            notifications.show({
              title: 'Category deleted',
              message: `Category has been deleted`,
              color: 'green',
            });
            if (isParent) {
              navigation({ to: '/categories' });
            } else {
              navigation({
                to: '/categories/$id',
                params: { id: category.parentId! },
              });
            }
          },
          onError: (error) => {
            console.error(error);
            notifications.show({
              title: 'Error Category update',
              message: `Changes not saved: ${error.message}`,
              color: 'red',
            });
          },
        },
      );
    }
  };

  return (
    <BaseScreen isLoading={isLoading}>
      <div className="space-y-4">
        <AppSection>
          <div className="flex flex-col items-center gap-2 text-center">
            <GualletIcon
              iconName={category?.icon ?? 'question'}
              iconColor={category?.colour ?? 'black'}
            />
            <p className="text-sm font-medium">{category?.name}</p>
          </div>
        </AppSection>

        {isParent && (
          <AppSection title="Sub-categories">
            <div className="space-y-2">
              {category?.subCategories.map((subCategory) => (
                <CategoryRow
                  key={subCategory.id}
                  category={subCategory}
                  onClick={() => {
                    navigation({
                      to: '/categories/$id',
                      params: { id: subCategory.id },
                    });
                  }}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigation({
                    to: '/categories/new',
                    search: { parent: categoryId },
                  })
                }
              >
                Add new sub category
              </Button>
            </div>
          </AppSection>
        )}

        <AppSection>
          <div className="space-y-2">
            <Button
              type="button"
              onClick={() =>
                navigation({
                  to: '/categories/$id/edit',
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
          </div>
        </AppSection>
      </div>
    </BaseScreen>
  );
}
