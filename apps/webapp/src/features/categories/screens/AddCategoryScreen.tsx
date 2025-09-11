import { AppSection } from "@/components/Cards/AppSection";
import { GualletColorPicker } from "@/components/GualletColorPicker/GualletColorPicker";
import { IconPicker } from "@/components/IconPicker/IconPicker";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import { useCategoryMutations } from "@guallet/api-react";
import { Stack, Button, TextInput, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "@tanstack/react-router";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";

const categoryFormDataSchema = z.object({
  name: z.string().min(1, { message: "Category name is required" }).default(""),
  icon: z.string().default(""),
  colour: z.string().default(""),
});
type AddCategoryFormData = z.infer<typeof categoryFormDataSchema>;

interface AddCategoryScreenProps {
  parentId?: string;
}

export function AddCategoryScreen({
  parentId,
}: Readonly<AddCategoryScreenProps>) {
  const navigate = useNavigate();
  const { createCategoryMutation } = useCategoryMutations();

  const form = useForm<AddCategoryFormData>({
    mode: "uncontrolled",
    validate: zodResolver(categoryFormDataSchema),
    initialValues: {
      name: "",
      colour: "",
      icon: "",
    },
  });

  async function onFormSubmit(data: AddCategoryFormData): Promise<void> {
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
            navigate({ to: "/categories/$id", params: { id: parentId } });
          } else {
            navigate({ to: "/categories" });
          }
        },
        onError: (error) => {
          console.error(error);
        },
      }
    );
  }

  return (
    <BaseScreen isLoading={createCategoryMutation.isPending}>
      <form onSubmit={form.onSubmit(onFormSubmit)}>
        <Stack gap={"md"}>
          <AppSection title="Add Category">
            <TextInput
              withAsterisk
              label="Name"
              placeholder="Enter category name"
              key={form.key("name")}
              {...form.getInputProps("name")}
            />
            <IconPicker
              name="icon"
              label="Icon"
              description="Select an icon for the category"
              required
              value={form.values.icon}
              onValueChanged={(iconName) =>
                form.setFieldValue("icon", iconName ?? "")
              }
            />
            <GualletColorPicker
              label="Colour"
              {...form.getInputProps("colour")}
              value={form.values.colour}
              onColourSelected={(colour) =>
                form.setFieldValue("colour", colour)
              }
            />
          </AppSection>
          <Group>
            <Button type="submit">Create category</Button>
            <Button
              variant="outline"
              onClick={() => {
                navigate({ to: "/categories" });
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
