import { Stack, NumberInput } from "@mantine/core";
import { Controller, useFormContext } from "react-hook-form";

export function CreditCardForm() {
  const { control } = useFormContext();

  return (
    <Stack>
      <Controller
        name="credit_limit"
        control={control}
        render={({ field }) => (
          <NumberInput
            {...field}
            label="Credit limit"
            required
            description="The credit limit of the account"
            defaultValue={0}
            leftSection={"£"} // TODO: Get the currency from the parent form
          />
        )}
      />
      <Controller
        name="interest_rate"
        control={control}
        render={({ field }) => (
          <NumberInput
            {...field}
            label="Interest rate"
            required
            description="The interest rate of the account"
            defaultValue={0}
            leftSection={"%"}
          />
        )}
      />
    </Stack>
  );
}
