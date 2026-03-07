import { AppSection } from '@/components/Cards/AppSection';
import { GualletColorPicker } from '@/components/GualletColorPicker/GualletColorPicker';
import { IconPicker } from '@/components/IconPicker/IconPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCategoryMutations } from '@guallet/api-react';
import { Button, Group, Stack, TextInput } from '@mantine/core';
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
      <form onSubmit={form.handleSubmit(onFormSubmit)}>
        <Stack gap={'md'}>
          <AppSection title="Add Category">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextInput
                  withAsterisk
                  label="Name"
                  placeholder="Enter category name"
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(event.currentTarget.value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  error={errors.name?.message}
                />
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
          </AppSection>
          <Group>
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
          </Group>
        </Stack>
      </form>
    </BaseScreen>
  );
}
