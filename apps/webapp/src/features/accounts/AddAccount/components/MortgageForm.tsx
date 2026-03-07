import { NumberInput, Stack } from '@mantine/core';

export function MortgageForm() {
  return (
    <Stack>
      <NumberInput
        label="Remaining balance"
        required
        description="The remaining balance of the account"
        defaultValue={0}
        leftSection="%"
      />

      <NumberInput
        label="Interest rate"
        required
        description="The interest rate of the account"
        defaultValue={0}
        leftSection="%"
      />
    </Stack>
  );
}
