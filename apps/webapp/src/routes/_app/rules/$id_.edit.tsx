import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import {
  loadRule,
  loadFieldDefinitions,
  updateRule,
} from "@/features/rules/api/rules.api";
import { loadCategories } from "@/features/categories/api/categories.api";
import { RuleForm, RuleFormData } from "@/features/rules/components/RuleForm";

export const Route = createFileRoute("/_app/rules/$id_/edit")({
  component: EditRulePage,
  loader: loader,
});

async function loader({ params }: { params: { id: string } }) {
  const [rule, fieldDefinitions, categories] = await Promise.all([
    loadRule(params.id),
    loadFieldDefinitions(),
    loadCategories(),
  ]);
  return {
    rule,
    fieldDefinitions: fieldDefinitions.fields,
    categories,
  };
}

function EditRulePage() {
  const { rule, fieldDefinitions, categories } = Route.useLoaderData();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialData: RuleFormData = {
    name: rule.name,
    description: rule.description ?? "",
    resultCategoryId: rule.resultCategoryId,
    isActive: rule.isActive,
    conditionLogic: rule.conditionLogic ?? "and",
    conditions: rule.conditions.map((c) => ({
      id: c.id,
      field: c.field,
      operator: c.operator,
      value: c.value,
    })),
  };

  const handleSubmit = async (data: RuleFormData) => {
    setIsSubmitting(true);
    try {
      await updateRule(id, {
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
        message: "Rule updated successfully",
        color: "green",
      });
      navigate({ to: "/rules" });
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to update rule",
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
      <Title order={2}>Edit Rule</Title>
      <RuleForm
        initialData={initialData}
        fieldDefinitions={fieldDefinitions}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        submitLabel="Update Rule"
      />
    </Stack>
  );
}
