import { Stack, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/form";

export function CreditCardForm() {
  // TODO: Restore the form state from the parent form
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      credit_limit: 0,
      interest_rate: 0,
    },
  });

  return (
    <Stack>
      <NumberInput
        key={form.key("credit_limit")}
        {...form.getInputProps("credit_limit")}
        label="Credit limit"
        required
        description="The credit limit of the account"
        defaultValue={0}
        leftSection={"£"} // TODO: Get the currency from the parent form
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
