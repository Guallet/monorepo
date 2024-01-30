import { Stack, NumberInput } from "@mantine/core";
import { Controller, useFormContext } from "react-hook-form";

export function CurrentAccountForm() {
  const { control } = useFormContext();

  return (
    <Stack>
      <Controller
        name="interest_rate"
        control={control}
        render={({ field }) => (
          <NumberInput
            {...field}
            label="Interest rate"
            description="The interest rate of the account"
            defaultValue={0}
            leftSection={"%"}
          />
        )}
      />
    </Stack>
  );
}
