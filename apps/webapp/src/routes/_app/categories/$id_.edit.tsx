import { AppSection } from '@/components/Cards/AppSection';
import { gualletClient } from '@/api/gualletClient';
import { useCategory } from '@guallet/api-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { notifications } from '@/lib/notifications';
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { BaseScreen } from '@/components/Screens/BaseScreen';

export const Route = createFileRoute('/_app/categories/$id_/edit')({
  component: EditCategoryPage,
});

function EditCategoryPage() {
  const navigation = useNavigate();
  const { id } = Route.useParams();

  const { category, isLoading } = useCategory(id);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [icon, setIcon] = useState<string>('');
  const [color, setColor] = useState<string>('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
      setColor(category.colour);
    }
  }, [category]);

  if (isLoading === false && category === null) {
    // Parent category not found
    notFound();
  }

  const handleSave = async () => {
    try {
      // Save category
      setIsBusy(true);

      const updatedCategory = await gualletClient.categories.update({
        id: id,
        dto: {
          name: name,
          icon: icon,
          colour: color,
        },
      });

      notifications.show({
        title: 'Category updated',
        message: `Category ${updatedCategory.name} has been updated`,
        color: 'green',
      });

      navigation({ to: '/categories/$id', params: { id: id } });
    } catch (error) {
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <BaseScreen isLoading={isLoading}>
      <div className="space-y-4">
        <AppSection title="Category details">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="category-edit-name">Name</Label>
              <Input
                id="category-edit-name"
                placeholder="Enter category name"
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category-edit-icon">Icon</Label>
              <Input
                id="category-edit-icon"
                placeholder="Enter icon name"
                value={icon}
                onChange={(event) => setIcon(event.currentTarget.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category-edit-colour">Colour</Label>
              <Input
                id="category-edit-colour"
                type="color"
                value={color || '#25262b'}
                onChange={(event) => {
                  setColor(event.currentTarget.value);
                }}
                className="h-10 w-20 cursor-pointer p-1"
              />
            </div>
          </div>
        </AppSection>
        <Button
          type="button"
          onClick={() => {
            handleSave();
          }}
          disabled={isBusy}
        >
          {isBusy ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </BaseScreen>
  );
}
