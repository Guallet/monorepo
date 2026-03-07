import { useDisclosure } from '@/hooks/useDisclosure';
import { ResponsiveModal } from '@guallet/ui-react';
import { IconSelect } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GualletIcon } from '../GualletIcon/GualletIcon';
import { IconPickerModal } from './IconPickerModal';

interface IconPickerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  value: string | null;
  onValueChanged: (value: string | null) => void;
  name?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function IconPicker({
  value,
  onValueChanged,
  name,
  label,
  description,
  error,
  required,
  disabled,
  placeholder,
  className,
  style,
  ...props
}: Readonly<IconPickerProps>) {
  const [opened, { open, close }] = useDisclosure(false);
  const hasValue = Boolean(value);
  const hasError = Boolean(error);
  const inputId = name ?? 'icon-picker';

  return (
    <>
      <ResponsiveModal
        opened={opened}
        onClose={close}
        title="Select Icon"
        size="lg"
      >
        <IconPickerModal
          onIconSelected={(icon) => {
            onValueChanged(icon ?? null);
            close();
          }}
          onCancel={close}
        />
      </ResponsiveModal>

      <div className={cn('grid gap-2', className)} style={style} {...props}>
        <label className="text-sm font-medium" htmlFor={inputId}>
          {label ?? 'Icon'}
          {required ? <span className="text-destructive"> *</span> : null}
        </label>

        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}

        <Button
          id={inputId}
          type="button"
          variant="outline"
          aria-invalid={hasError}
          disabled={disabled}
          name={name}
          className={cn('w-full justify-between font-normal', {
            'text-muted-foreground': !hasValue,
          })}
          onClick={open}
        >
          {hasValue ? (
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center text-muted-foreground">
                <GualletIcon iconName={value ?? undefined} size={18} />
              </span>
              <span>{value}</span>
            </span>
          ) : (
            <span>{placeholder ?? 'Select icon'}</span>
          )}

          <IconSelect className="text-muted-foreground" />
        </Button>

        {hasError ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </>
  );
}
