import { Currency } from '@guallet/money';
import { ResponsiveModal } from '@guallet/ui-react';
import { Input, InputWrapperProps } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSelector } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);

  const currency = value ? Currency.fromISOCode(value) : null;

  return (
    <>
      <ResponsiveModal
        opened={opened}
        onClose={close}
        title={t('components.currencyPicker.modal.title')}
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
        label={t('components.currencyPicker.input.label')}
        description={t('components.currencyPicker.input.description')}
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
            <Input.Placeholder>
              {t('components.currencyPicker.input.placeholder')}
            </Input.Placeholder>
          ) : (
            `${currency.symbol} - ${currency.name} - ${currency.code}`
          )}
        </Input>
      </Input.Wrapper>
    </>
  );
}
