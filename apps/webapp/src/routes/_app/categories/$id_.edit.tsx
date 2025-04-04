import { AppSection } from "@/components/Cards/AppSection";
import { AppScreen } from "@/components/Layout/AppScreen";
import { gualletClient } from "@/core/api/gualletClient";
import { useCategory } from "@guallet/api-react";
import { Stack, TextInput, ColorInput, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/categories/$id_/edit")({
  component: EditCategoryPage,
});

function EditCategoryPage() {
  const navigation = useNavigate();
  const { id } = Route.useParams();

  const { category, isLoading } = useCategory(id);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [icon, setIcon] = useState<string>("");
  const [color, setColor] = useState<string>("");

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
        title: "Category updated",
        message: `Category ${updatedCategory.name} has been updated`,
        color: "green",
      });

      navigation({ to: "/categories/$id", params: { id: id } });
    } catch (error) {
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <AppScreen isLoading={isLoading}>
      <Stack>
        <AppSection title="Category details">
          <TextInput
            label="Name"
            placeholder="Enter category name"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
          />
          <TextInput
            label="Icon"
            placeholder="Enter icon name"
            value={icon}
            onChange={(event) => setIcon(event.currentTarget.value)}
          />
          <ColorInput
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
        </AppSection>
        <Button
          onClick={() => {
            handleSave();
          }}
          loading={isBusy}
        >
          Save
        </Button>
      </Stack>
    </AppScreen>
  );
}
