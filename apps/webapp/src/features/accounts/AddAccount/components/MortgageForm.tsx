import { Stack, NumberInput } from "@mantine/core";
import { Controller, useFormContext } from "react-hook-form";

export function MortgageForm() {
  const { control } = useFormContext();

  return (
    <Stack>
      <Controller
        name="remaining_balance"
        control={control}
        render={({ field }) => (
          <NumberInput
            {...field}
            label="Remaining balance"
            required
            description="The remaining balance of the account"
            defaultValue={0}
            leftSection={"%"}
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
