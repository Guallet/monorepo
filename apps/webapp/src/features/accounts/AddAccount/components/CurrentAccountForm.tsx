import { Stack, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/form";

export function CurrentAccountForm() {
  // TODO: Restore the form state from the parent form
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      interest_rate: 0,
    },
  });

  return (
    <Stack>
      <NumberInput
        key={form.key("interest_rate")}
        {...form.getInputProps("interest_rate")}
        label="Interest rate"
        description="The interest rate of the account"
        defaultValue={0}
        leftSection={"%"}
      />
    </Stack>
  );
}
