import React from "react";
import { TextInput, Stack, Group, Button, Image, Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import { InstitutionDto } from "@guallet/api-client";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  
  const form = useForm<InstitutionFormData>({
    mode: "uncontrolled",
    initialValues: {
      name: initialValues?.name || "",
      image_src: initialValues?.image_src || "",
      // Note: Custom institutions only support a single country, while system institutions can have multiple
      // For editing, we use the first country in the array
      country: initialValues?.countries?.[0] || "",
    },
    validate: {
      name: (value) => (value.trim().length < 1 ? t("feature.institutions.form.fields.name.required") : null),
      country: (value) => {
        if (value.trim().length < 1) return t("feature.institutions.form.fields.country.required");
        // Basic validation for 2-letter country code format (ISO 3166-1 alpha-2)
        // The backend will validate if the country code is actually valid
        if (!/^[A-Z]{2}$/i.test(value.trim())) {
          return t("feature.institutions.form.fields.country.invalid");
        }
        return null;
      },
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
          label={t("feature.institutions.form.fields.name.label")}
          placeholder={t("feature.institutions.form.fields.name.placeholder")}
          key={form.key("name")}
          {...form.getInputProps("name")}
        />

        <TextInput
          label={t("feature.institutions.form.fields.imageUrl.label")}
          placeholder={t("feature.institutions.form.fields.imageUrl.placeholder")}
          description={t("feature.institutions.form.fields.imageUrl.description")}
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
          label={t("feature.institutions.form.fields.country.label")}
          placeholder={t("feature.institutions.form.fields.country.placeholder")}
          description={t("feature.institutions.form.fields.country.description")}
          key={form.key("country")}
          {...form.getInputProps("country")}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t("feature.institutions.form.buttons.cancel")}
          </Button>
          <Button type="submit" loading={isLoading}>
            {initialValues ? t("feature.institutions.form.buttons.update") : t("feature.institutions.form.buttons.create")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default InstitutionForm;
