import { AppSection } from '@/components/Cards/AppSection';
import { GualletColorPicker } from '@/components/GualletColorPicker/GualletColorPicker';
import { IconPicker } from '@/components/IconPicker/IconPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCategoryMutations } from '@guallet/api-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

const categoryFormDataSchema = z.object({
  name: z.string().min(1, { error: 'Category name is required' }),
  icon: z.string(),
  colour: z.string(),
});
type CategoryFormData = z.infer<typeof categoryFormDataSchema>;

interface AddCategoryScreenProps {
  parentId?: string;
}

export function AddCategoryScreen({
  parentId,
}: Readonly<AddCategoryScreenProps>) {
  const navigate = useNavigate();
  const { createCategoryMutation } = useCategoryMutations();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormDataSchema),
    defaultValues: {
      name: '',
      colour: '',
      icon: '',
    },
  });
  const {
    control,
    formState: { errors },
  } = form;

  const selectedIcon = useWatch({
    control,
    name: 'icon',
  });
  const selectedColour = useWatch({
    control,
    name: 'colour',
  });

  async function onFormSubmit(data: CategoryFormData): Promise<void> {
    createCategoryMutation.mutate(
      {
        request: {
          name: data.name,
          icon: data.icon,
          colour: data.colour,
          parentId: parentId,
        },
      },
      {
        onSuccess: () => {
          if (parentId) {
            navigate({ to: '/categories/$id', params: { id: parentId } });
          } else {
            navigate({ to: '/categories' });
          }
        },
        onError: (error) => {
          console.error(error);
        },
      },
    );
  }

  return (
    <BaseScreen isLoading={createCategoryMutation.isPending}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onFormSubmit)}>
          <AppSection title="Add Category">
            <div className="space-y-4">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <div className="grid gap-2">
                    <Label htmlFor="category-name">Name</Label>
                    <Input
                      id="category-name"
                      required
                      placeholder="Enter category name"
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(event.currentTarget.value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                    {errors.name?.message ? (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    ) : null}
                  </div>
                )}
              />
              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <IconPicker
                    name={field.name}
                    label="Icon"
                    description="Select an icon for the category"
                    required
                    value={selectedIcon ?? ''}
                    onValueChanged={(iconName) => {
                      field.onChange(iconName ?? '');
                    }}
                    error={errors.icon?.message}
                  />
                )}
              />
              <Controller
                name="colour"
                control={control}
                render={({ field }) => (
                  <GualletColorPicker
                    label="Colour"
                    value={selectedColour ?? ''}
                    onColourSelected={(colour) => {
                      field.onChange(colour);
                    }}
                    error={errors.colour?.message}
                  />
                )}
              />
            </div>
          </AppSection>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Create category</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                navigate({ to: '/categories' });
              }}
            >
              Cancel
            </Button>
          </div>
      </form>
    </BaseScreen>
  );
}
