import { GualletColorPicker } from '@/components/GualletColorPicker/GualletColorPicker';
import { IconPicker } from '@/components/IconPicker/IconPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useCategoryMutations } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Box, Button, Card, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from '@tanstack/react-router';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const categoryFormDataSchema = z.object({
  name: z.string().min(1, { message: 'Category name is required' }).default(''),
  icon: z.string().default(''),
  colour: z.string().default(''),
});
type AddCategoryFormData = z.infer<typeof categoryFormDataSchema>;

interface AddCategoryScreenProps {
  parentId?: string;
}

export function AddCategoryScreen({
  parentId,
}: Readonly<AddCategoryScreenProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const navigate = useNavigate();
  const { createCategoryMutation } = useCategoryMutations();

  const form = useForm<AddCategoryFormData>({
    mode: 'uncontrolled',
    validate: zod4Resolver(categoryFormDataSchema),
    initialValues: { name: '', colour: '', icon: '' },
  });

  function onFormSubmit(data: AddCategoryFormData): void {
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
    <BaseScreen
      isLoading={createCategoryMutation.isPending}
      title={t('screens.categories.add.title', 'New category')}
    >
      <Box maw={560} mx="auto">
        <form onSubmit={form.onSubmit(onFormSubmit)}>
          <Stack gap={spacing.md}>
            <Card
              withBorder
              shadow="sm"
              radius="lg"
              padding={{ base: 'md', sm: 'lg' }}
            >
              <Stack gap={spacing.md}>
                <TextInput
                  withAsterisk
                  label={t('screens.categories.add.fields.name.label', 'Name')}
                  placeholder={t(
                    'screens.categories.add.fields.name.placeholder',
                    'Enter category name',
                  )}
                  key={form.key('name')}
                  {...form.getInputProps('name')}
                />
                <IconPicker
                  name="icon"
                  required
                  label={t('screens.categories.add.fields.icon.label', 'Icon')}
                  description={t(
                    'screens.categories.add.fields.icon.description',
                    'Select an icon for the category',
                  )}
                  value={form.values.icon}
                  onValueChanged={(iconName) =>
                    form.setFieldValue('icon', iconName ?? '')
                  }
                />
                <GualletColorPicker
                  label={t(
                    'screens.categories.add.fields.colour.label',
                    'Colour',
                  )}
                  {...form.getInputProps('colour')}
                  value={form.values.colour}
                  onColourSelected={(colour) =>
                    form.setFieldValue('colour', colour)
                  }
                />
              </Stack>
            </Card>

            <Stack gap="xs" hiddenFrom="sm">
              <Button
                type="submit"
                fullWidth
                size="md"
                loading={createCategoryMutation.isPending}
              >
                {t('screens.categories.add.submitButton', 'Create category')}
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="md"
                onClick={() => navigate({ to: '/categories' })}
              >
                {t('screens.categories.add.cancelButton', 'Cancel')}
              </Button>
            </Stack>
            <Group justify="flex-end" gap="xs" visibleFrom="sm">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/categories' })}
              >
                {t('screens.categories.add.cancelButton', 'Cancel')}
              </Button>
              <Button type="submit" loading={createCategoryMutation.isPending}>
                {t('screens.categories.add.submitButton', 'Create category')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </BaseScreen>
  );
}
