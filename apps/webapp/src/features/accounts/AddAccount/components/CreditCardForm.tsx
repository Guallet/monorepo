import { NumberInput, Stack } from '@mantine/core';

export function CreditCardForm() {
  return (
    <Stack>
      <NumberInput
        label="Credit limit"
        required
        description="The credit limit of the account"
        defaultValue={0}
        leftSection="£" // TODO: Get the currency from the parent form
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
