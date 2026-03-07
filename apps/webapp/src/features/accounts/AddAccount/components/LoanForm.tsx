import { NumberInput, Stack } from '@mantine/core';

export function LoanForm() {
  return (
    <Stack>
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
