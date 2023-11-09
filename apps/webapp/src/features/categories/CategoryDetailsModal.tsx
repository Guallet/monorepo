import { Button, ColorInput, Group, Stack, TextInput } from "@mantine/core";
import { Category } from "./models/Category";

interface Props {
  category: Category | null;
  //   onSubmit: (category: AppCategory) => void;
  //   onCancel: (category: AppCategory) => void;
  //   onDelete: (category: AppCategory) => void;
}

export function CategoriesDetailsModal({ category }: Props) {
  return (
    <Stack>
      <TextInput
        label="Name"
        description="Category name"
        placeholder="Enter the name of the category"
        defaultValue={category?.name}
      />
      <TextInput
        label="Icon"
        description="Category Icon"
        placeholder="Select the category icon"
        defaultValue={category?.icon}
      />
      <ColorInput
        closeOnColorSwatchClick
        label="Colour"
        placeholder="Select the category colour"
        defaultValue={category?.colour}
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
        <Button>Save</Button>
        <Button>Cancel</Button>
      </Group>
    </Stack>
  );
}
