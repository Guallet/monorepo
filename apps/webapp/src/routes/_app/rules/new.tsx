import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { gualletClient } from "@/api/gualletClient";
import { loadCategories } from "@/features/categories/api/categories.api";
import { RuleForm, RuleFormData } from "@/features/rules/components/RuleForm";

export const Route = createFileRoute("/_app/rules/new")({
  component: NewRulePage,
  loader: loader,
});

async function loader() {
  const [fieldDefinitions, categories] = await Promise.all([
    gualletClient.rules.getFieldDefinitions(),
    loadCategories(),
  ]);
  return { fieldDefinitions: fieldDefinitions.fields, categories };
}

function NewRulePage() {
  const { fieldDefinitions, categories } = Route.useLoaderData();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: RuleFormData) => {
    setIsSubmitting(true);
    try {
      await gualletClient.rules.create({
        name: data.name,
        description: data.description || undefined,
        resultCategoryId: data.resultCategoryId,
        isActive: data.isActive,
        conditionLogic: data.conditionLogic,
        conditions: data.conditions.map((c, index) => ({
          field: c.field,
          operator: c.operator,
          value: c.value,
          order: index,
        })),
      });
      notifications.show({
        title: "Success",
        message: "Rule created successfully",
        color: "green",
      });
      navigate({ to: "/rules" });
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to create rule",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate({ to: "/rules" });
  };

  return (
    <Stack gap="md">
      <Title order={2}>Create New Rule</Title>
      <RuleForm
        fieldDefinitions={fieldDefinitions}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        submitLabel="Create Rule"
      />
    </Stack>
  );
}
