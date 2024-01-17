import { TextInput, Stack } from "@mantine/core";

export function LoanForm() {
  return (
    <Stack>
      <TextInput
        name="interest_rate"
        label="Interest rate"
        required
        description="The interest rate of the account"
        defaultValue={0}
        type="number"
        leftSection={"%"}
      />
    </Stack>
  );
}
