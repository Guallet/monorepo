import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { useGroupedCategories } from '@guallet/api-react';
import { useNavigate } from '@tanstack/react-router';
import { AppCategorySection } from '../components/AppCategorySection/AppCategorySection';

export function CategoryListScreen() {
  const { categories, isLoading } = useGroupedCategories();
  const navigation = useNavigate();

  return (
    <BaseScreen isLoading={isLoading}>
      <div className="space-y-3">
        <Button
          type="button"
          onClick={() =>
            navigation({
              to: '/categories/new',
            })
          }
        >
          Add new parent category
        </Button>
        {categories.map((category) => (
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
        ))}
      </div>
    </BaseScreen>
  );
}
