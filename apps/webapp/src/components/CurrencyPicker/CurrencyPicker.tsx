import { Currency } from '@guallet/money';
import { ResponsiveModal } from '@guallet/ui-react';
import { useDisclosure } from '@/hooks/useDisclosure';
import { IconSelector } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CurrencyPickerModal } from './CurrencyPickerModal';

interface CurrencyPickerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  value: string | null;
  onValueChanged: (value: string | null) => void;
  name?: string;
  selectionMode?: 'single' | 'multiple';
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function CurrencyPicker({
  value,
  onValueChanged,
  name,
  selectionMode = 'single',
  label,
  description,
  error,
  required,
  disabled,
  placeholder,
  className,
  style,
  ...props
}: Readonly<CurrencyPickerProps>) {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const hasError = Boolean(error);

  const currency = value ? Currency.fromISOCode(value) : null;
  const inputId = name ?? 'currency-picker';

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
          onCurrencySelected={(selectedCurrency) => {
            onValueChanged(selectedCurrency.code);
            close();
          }}
          onCancel={close}
        />
      </ResponsiveModal>

      <div className={cn('grid gap-2', className)} style={style} {...props}>
        <label className="text-sm font-medium" htmlFor={inputId}>
          {label ?? t('components.currencyPicker.input.label')}
          {required ? <span className="text-destructive"> *</span> : null}
        </label>
        <p className="text-sm text-muted-foreground">
          {description ?? t('components.currencyPicker.input.description')}
        </p>
        <Button
          id={inputId}
          aria-invalid={hasError}
          className={cn('w-full justify-between font-normal', {
            'text-muted-foreground': currency === null,
          })}
          variant="outline"
          disabled={disabled}
          name={name}
          type="button"
          onClick={open}
        >
          {currency === null
            ? (placeholder ?? t('components.currencyPicker.input.placeholder'))
            : `${currency.symbol} - ${currency.name} - ${currency.code}`}
          <IconSelector className="text-muted-foreground" />
        </Button>
        {hasError ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </>
  );
}
