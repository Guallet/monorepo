import { BaseScreen } from '@/components/Screens/BaseScreen';
import {
  useGroupedCategories,
  useSeedDefaultCategoriesMutation,
} from '@guallet/api-react';
import { Stack, Button } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { AppCategorySection } from '../components/AppCategorySection/AppCategorySection';
import { EmptyState } from '@/components/EmptyState/EmptyState';

export function CategoryListScreen() {
  const { categories, isLoading } = useGroupedCategories();
  const navigation = useNavigate();
  const seedMutation = useSeedDefaultCategoriesMutation();

  return (
    <BaseScreen isLoading={isLoading}>
      <Stack>
        <Button
          onClick={() =>
            navigation({
              to: '/categories/new',
            })
          }
        >
          Add new parent category
        </Button>
        {categories.length === 0 && !isLoading ? (
          <EmptyState
            loading={seedMutation.isPending}
            title="No categories yet"
            description="Create your default categories to start organising your transactions."
            primaryAction={{
              label: 'Create default categories',
              onClick: () => seedMutation.mutate(),
            }}
          />
        ) : (
          categories.map((category) => (
            <AppCategorySection
              key={category.id}
              category={category}
              onCategorySelected={(category) => {
                navigation({
                  to: '/categories/$id',
                  params: { id: category.id },
                });
              }}
              onAddSubcategoryClick={(parentCategory) => {
                navigation({
                  to: '/categories/new',
                  search: { parent: parentCategory.id },
                });
              }}
            />
          ))
        )}
      </Stack>
    </BaseScreen>
  );
}
