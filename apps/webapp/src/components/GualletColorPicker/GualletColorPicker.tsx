import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const defaultSwatches = [
  '#25262b',
  '#868e96',
  '#fa5252',
  '#e64980',
  '#be4bdb',
  '#7950f2',
  '#4c6ef5',
  '#228be6',
  '#15aabf',
  '#12b886',
  '#40c057',
  '#82c91e',
  '#fab005',
  '#fd7e14',
  '#fd7e14',
  '#fd7e14',
];

interface GualletColorPickerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  value?: string;
  defaultValue?: string;
  label?: React.ReactNode;
  placeholder?: string;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  error?: React.ReactNode;
  description?: React.ReactNode;
  swatches?: string[];
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onColourSelected: (colour: string) => void;
}

const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const FALLBACK_COLOR = '#4c6ef5';

function normalizeHexColour(colour: string): string {
  const trimmedColour = colour.trim().toLowerCase();
  if (trimmedColour === '') {
    return '';
  }

  return trimmedColour.startsWith('#') ? trimmedColour : `#${trimmedColour}`;
}

function isHexColour(colour: string): boolean {
  return HEX_COLOR_PATTERN.test(colour);
}

export function GualletColorPicker({
  onColourSelected,
  value,
  defaultValue,
  label,
  placeholder,
  name,
  id,
  required,
  disabled,
  error,
  description,
  swatches,
  onBlur,
  className,
  style,
  ...props
}: Readonly<GualletColorPickerProps>) {
  const { t } = useTranslation();
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const inputValue = value ?? internalValue;

  const normalizedValue = useMemo(
    () => normalizeHexColour(inputValue),
    [inputValue],
  );

  const resolvedPickerColour = isHexColour(normalizedValue)
    ? normalizedValue
    : FALLBACK_COLOR;
  const hasError = Boolean(error);
  const fieldId = id ?? name ?? 'guallet-colour-picker';

  const commitColour = (rawColour: string) => {
    const normalizedColour = normalizeHexColour(rawColour);

    if (value === undefined) {
      setInternalValue(normalizedColour);
    }

    if (isHexColour(normalizedColour)) {
      onColourSelected(normalizedColour);
    }
  };

  return (
    <div className={cn('grid gap-2', className)} style={style} {...props}>
      <Label htmlFor={fieldId}>
        {label ?? t('components.colorPicker.label', 'Colour')}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={t('components.colorPicker.label', 'Colour')}
          disabled={disabled}
          value={resolvedPickerColour}
          onChange={(event) => {
            commitColour(event.target.value);
          }}
          className="h-9 w-12 cursor-pointer rounded-md border border-input bg-background p-1"
        />
        <Input
          id={fieldId}
          name={name}
          type="text"
          placeholder={
            placeholder ??
            t('components.colorPicker.placeholder', 'Select the colour')
          }
          value={inputValue}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          onChange={(event) => {
            const nextValue = event.target.value;

            if (value === undefined) {
              setInternalValue(nextValue);
            }

            const normalizedColour = normalizeHexColour(nextValue);
            if (isHexColour(normalizedColour)) {
              onColourSelected(normalizedColour);
            }
          }}
          onBlur={(event) => {
            const normalizedColour = normalizeHexColour(event.target.value);

            if (normalizedColour === '') {
              onBlur?.(event);
              return;
            }

            if (isHexColour(normalizedColour)) {
              if (value === undefined) {
                setInternalValue(normalizedColour);
              }

              onColourSelected(normalizedColour);
            } else if (value === undefined) {
              setInternalValue('');
            }

            onBlur?.(event);
          }}
        />
      </div>
      <div className="grid grid-cols-8 gap-2">
        {(swatches ?? defaultSwatches).map((swatchColour, index) => (
          <button
            type="button"
            key={`${swatchColour}-${index}`}
            aria-label={swatchColour}
            disabled={disabled}
            onClick={() => {
              commitColour(swatchColour);
            }}
            className={cn(
              'h-6 w-6 rounded border border-border transition-transform hover:scale-105',
              normalizedValue === normalizeHexColour(swatchColour)
                ? 'ring-2 ring-ring ring-offset-2'
                : null,
            )}
            style={{ backgroundColor: swatchColour }}
          />
        ))}
      </div>
      {hasError ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
