import { gualletClient } from "@/App";
import { AppSection } from "@/components/Cards/AppSection";
import { AppScreen } from "@/components/Layout/AppScreen";
import { useCategories, useCategory } from "@guallet/api-react";
import { Button, ColorInput, Stack, Text, TextInput } from "@mantine/core";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";

const addCategorySearchSchema = z.object({
  parent: z.string().optional(),
});

type AddCategorySearchSchema = z.infer<typeof addCategorySearchSchema>;

export const Route = createFileRoute("/_app/categories/new")({
  component: AddCategoryPage,
  validateSearch: addCategorySearchSchema,
});

function AddCategoryPage() {
  const navigation = useNavigate();

  const { parent } = Route.useSearch();
  const isSubcategory = parent !== undefined;
  const { category, isLoading } = useCategory(parent ?? null);
  const [name, setName] = useState<string>("");
  const [icon, setIcon] = useState<string>("question");
  const [color, setColor] = useState<string>("#25262b");

  const [isBusy, setIsBusy] = useState<boolean>(false);

  if (isLoading === false && category === null) {
    // Parent category not found
    notFound();
  }

  const handleSave = async () => {
    try {
      // Save category
      setIsBusy(true);

      await gualletClient.categories.create({
        name: name,
        icon: icon,
        colour: color,
        parentId: parent,
      });

      if (isSubcategory) {
        navigation({ to: "/categories/$id", params: { id: parent } });
      } else {
        navigation({ to: "/categories" });
      }
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
        >
          Save
        </Button>
      </Stack>
    </AppScreen>
  );
}
