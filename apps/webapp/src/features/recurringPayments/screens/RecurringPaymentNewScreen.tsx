import { BaseScreen } from "@/components/Screens/BaseScreen";
import { Stack, Text, Group } from "@mantine/core";
import { IconRepeat, IconPlus } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { RecurringPaymentForm } from "../components/RecurringPaymentForm";

export function RecurringPaymentNewScreen() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate({ to: "/recurring-payments" });
  };

  const handleCancel = () => {
    navigate({ to: "/recurring-payments" });
  };

  return (
    <BaseScreen>
      <Stack gap="lg">
        <Group>
          <IconPlus size={24} />
          <Text size="xl" fw={700}>
            Create Recurring Payment
          </Text>
        </Group>

        <RecurringPaymentForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Stack>
    </BaseScreen>
  );
}
