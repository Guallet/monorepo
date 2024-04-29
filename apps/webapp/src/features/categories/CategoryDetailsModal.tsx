import { Button, ColorInput, Group, Stack, TextInput } from "@mantine/core";
import { Category } from "./models/Category";
import { useEffect, useState } from "react";

interface Props {
  category: Category | null;
  onSave: (data: CategoryFormData) => void;
  onUpdate: (category: Category, data: CategoryFormData) => void;
  onCancel: () => void;
  onDelete: (category: Category) => void;
}

export type CategoryFormData = {
  name: string;
  icon: string;
  colour: string;
  parentId: string | null;
};

export function CategoriesDetailsModal({
  category,
  onSave,
  onUpdate,
  onCancel,
  onDelete,
}: Props) {
  const [name, setName] = useState(category?.name ?? "");
  const [nameError, setNameError] = useState(false);

  const [icon, setIcon] = useState(category?.icon ?? "");
  const [iconError, setIconError] = useState(false);

  const [colour, setColour] = useState(category?.colour ?? "");
  const [colourError, setColourError] = useState(false);

  const [isFormValid, setIsFormValid] = useState(false);

  function save() {
    // Validate form
    if (validateForm()) {
      const formData: CategoryFormData = {
        name: name ?? "",
        icon: icon ?? "",
        colour: colour,
        parentId: category?.parentId ?? null,
      };
      if (category) {
        onUpdate(category, formData);
      } else {
        onSave(formData);
      }
    } else {
      // Show error
    }
  }

  function validateForm(): boolean {
    const nameError = name.length === 0;
    const iconError = icon.length === 0;
    const colourError = colour.length === 0;

    setNameError(nameError);
    setIconError(iconError);
    setColourError(colourError);

    return !nameError && !iconError && !colourError;
  }

  useEffect(() => {
    // Check if we can enable or disable the submit button
    setIsFormValid(name.length > 0 && icon.length > 0 && colour.length > 0);
  }, [name, icon, colour]);

  return (
    <Stack>
      <TextInput
        label="Name"
        description="Category name"
        placeholder="Enter the name of the category"
        value={name}
        onChange={(event) => setName(event.currentTarget.value)}
        error={nameError && "Invalid name"}
      />
      <TextInput
        label="Icon"
        description="Category Icon"
        placeholder="Select the category icon"
        value={icon}
        onChange={(event) => setIcon(event.currentTarget.value)}
        error={iconError && "Invalid icon"}
      />
      <ColorInput
        closeOnColorSwatchClick
        label="Colour"
        placeholder="Select the category colour"
        value={colour}
        onChange={(value) => setColour(value)}
        error={colourError && "Invalid selected colour"}
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
      <Group>
        <Button onClick={save} disabled={!isFormValid}>
          {category ? "Update" : "Create"}
        </Button>
        <Button
          onClick={() => {
            onCancel();
          }}
        >
          Cancel
        </Button>
        {category && (
          <Button
            color="red"
            onClick={() => {
              onDelete(category);
            }}
          >
            Delete
          </Button>
        )}
      </Group>
    </Stack>
  );
}
