import React from "react";
import { TextInput, Stack, Group, Button, Image, Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import { InstitutionDto } from "@guallet/api-client";

interface InstitutionFormData {
  name: string;
  image_src: string;
  country: string;
}

interface InstitutionFormProps {
  onSubmit: (data: InstitutionFormData) => void;
  onCancel: () => void;
  initialValues?: InstitutionDto;
  isLoading?: boolean;
}

const InstitutionForm: React.FC<InstitutionFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  isLoading = false,
}) => {
  const form = useForm<InstitutionFormData>({
    mode: "uncontrolled",
    initialValues: {
      name: initialValues?.name || "",
      image_src: initialValues?.image_src || "",
      country: initialValues?.countries?.[0] || "",
    },
    validate: {
      name: (value) => (value.trim().length < 1 ? "Name is required" : null),
      country: (value) =>
        value.trim().length < 1 ? "Country is required" : null,
    },
  });

  const handleSubmit = (values: InstitutionFormData) => {
    onSubmit(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          withAsterisk
          label="Institution Name"
          placeholder="Enter institution name"
          key={form.key("name")}
          {...form.getInputProps("name")}
        />

        <TextInput
          label="Image URL"
          placeholder="https://example.com/logo.png"
          description="Provide a URL to the institution's logo"
          key={form.key("image_src")}
          {...form.getInputProps("image_src")}
        />

        {form.values.image_src && (
          <Box>
            <Image
              src={form.values.image_src}
              alt="Institution logo preview"
              width={100}
              height={100}
              fit="contain"
            />
          </Box>
        )}

        <TextInput
          withAsterisk
          label="Country"
          placeholder="Enter country code (e.g., US, GB, ES)"
          description="Two-letter country code"
          key={form.key("country")}
          {...form.getInputProps("country")}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {initialValues ? "Update" : "Create"} Institution
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default InstitutionForm;
