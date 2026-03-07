import { NumberInput, Stack } from '@mantine/core';

export function SavingsForm() {
  return (
    <Stack>
      <NumberInput
        label="Interest rate"
        description="The interest rate of the account"
        defaultValue={0}
        leftSection="%"
      />
    </Stack>
  );
}
