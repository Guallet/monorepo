import { Currency } from '@guallet/money';
import { ResponsiveModal } from '@guallet/ui-react';
import { Input, InputWrapperProps } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSelector } from '@tabler/icons-react';
import { CurrencyPickerModal } from './CurrencyPickerModal';

interface CurrencyPickerProps extends InputWrapperProps {
  value: string | null;
  onValueChanged: (value: string | null) => void;
  name: string | undefined;
  selectionMode?: 'single' | 'multiple';
}

export function CurrencyPicker({
  value,
  onValueChanged,
  name,
  selectionMode = 'single',
  ...props
}: Readonly<CurrencyPickerProps>) {
  const [opened, { open, close }] = useDisclosure(false);

  const currency = value ? Currency.fromISOCode(value) : null;

  return (
    <>
      <ResponsiveModal
        opened={opened}
        onClose={close}
        title="Select currency"
        size="lg"
      >
        <CurrencyPickerModal
          initialCurrency={currency}
          selectionMode={selectionMode}
          onCurrencySelected={(currency) => {
            onValueChanged?.(currency.code);
            close();
          }}
          onCancel={() => close()}
        />
      </ResponsiveModal>

      <Input.Wrapper
        label="Account currency"
        description="The currency of the account"
        {...props}
      >
        <Input
          name={name}
          component="button"
          type="button"
          pointer
          onClick={open}
          rightSection={<IconSelector />}
        >
          {currency === null ? (
            <Input.Placeholder>Select currency</Input.Placeholder>
          ) : (
            `${currency.symbol} - ${currency.name} - ${currency.code}`
          )}
        </Input>
      </Input.Wrapper>
    </>
  );
}
