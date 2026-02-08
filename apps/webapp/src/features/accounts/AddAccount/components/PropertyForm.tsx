import { Stack, NumberInput, TextInput, Textarea, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import { AccountInput } from '../../components/AccountInput';

export function PropertyForm() {
  // TODO: Restore the form state from the parent form
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      propertyType: 'residential',
      purchasePrice: 0,
      purchaseDate: new Date(),
      mostRecentValuation: null,
      notes: '',
      postcode: '',
      linkedMortgageAccountId: null,
    },
  });

  return (
    <Stack>
      <Select
        key={form.key('propertyType')}
        {...form.getInputProps('propertyType')}
        label="Property Type"
        required
        description="Type of property"
        data={[
          { value: 'residential', label: 'Residential' },
          { value: 'buy-to-let', label: 'Buy-to-let' },
        ]}
      />

      <NumberInput
        key={form.key('purchasePrice')}
        {...form.getInputProps('purchasePrice')}
        label="Purchase Price"
        required
        description="The purchase price of the property"
        defaultValue={0}
        leftSection={'£'}
        decimalScale={2}
        thousandSeparator=","
      />

      <DatePickerInput
        key={form.key('purchaseDate')}
        {...form.getInputProps('purchaseDate')}
        label="Date of Purchase"
        required
        description="When the property was purchased"
        placeholder="Select date"
      />

      <NumberInput
        key={form.key('mostRecentValuation')}
        {...form.getInputProps('mostRecentValuation')}
        label="Most Recent Valuation"
        description="The most recent valuation of the property (optional)"
        defaultValue={undefined}
        leftSection={'£'}
        decimalScale={2}
        thousandSeparator=","
      />

      <TextInput
        key={form.key('postcode')}
        {...form.getInputProps('postcode')}
        label="Postcode"
        description="Property postcode (optional)"
        placeholder="E.g., SW1A 1AA"
      />

      <AccountInput
        key={form.key('linkedMortgageAccountId')}
        {...form.getInputProps('linkedMortgageAccountId')}
        label="Linked Mortgage Account"
        description="Link to an existing mortgage account (optional)"
        placeholder="Select mortgage account"
        clearable
      />

      <Textarea
        key={form.key('notes')}
        {...form.getInputProps('notes')}
        label="Notes"
        description="Additional notes about the property (optional)"
        placeholder="Enter any additional notes"
        rows={4}
      />
    </Stack>
  );
}
