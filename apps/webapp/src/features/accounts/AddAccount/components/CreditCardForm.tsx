import { TextInput, Stack } from "@mantine/core";

export function CreditCardForm() {
  return (
    <Stack>
      <TextInput
        name="credit_limit"
        label="Credit limit"
        required
        description="The credit limit of the account"
        defaultValue={0}
        type="number"
        leftSection={"£"}
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
