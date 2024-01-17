import { TextInput, Stack } from "@mantine/core";

export function MortgageForm() {
  return (
    <Stack>
      <TextInput
        name="remaining_balance"
        label="Remaining balance"
        required
        description="The remaining balance of the account"
        defaultValue={0}
        type="number"
        leftSection={"%"}
      />
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
