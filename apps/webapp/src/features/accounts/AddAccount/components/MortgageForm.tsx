import { Stack, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/form";

export function MortgageForm() {
  // TODO: Restore the form state from the parent form
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      remaining_balance: 0,
      interest_rate: 0,
    },
  });

  return (
    <Stack>
      <NumberInput
        key={form.key("remaining_balance")}
        {...form.getInputProps("remaining_balance")}
        label="Remaining balance"
        required
        description="The remaining balance of the account"
        defaultValue={0}
        leftSection={"%"}
      />

      <NumberInput
        key={form.key("interest_rate")}
        {...form.getInputProps("interest_rate")}
        label="Interest rate"
        required
        description="The interest rate of the account"
        defaultValue={0}
        leftSection={"%"}
      />
    </Stack>
  );
}
