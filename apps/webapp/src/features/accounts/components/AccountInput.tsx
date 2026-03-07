import { AccountAvatar } from '@/components/AccountAvatar/AccountAvatar';
import { Label } from '@/components/ui/label';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { useAccounts } from '@guallet/api-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getAccountTypeTitle } from '../models/Account';

interface AccountInputProps {
  label?: string;
  placeholder?: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
  onBlur?: React.FocusEventHandler<HTMLSelectElement>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

export function AccountInput({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required,
  disabled,
  name,
  id,
  className,
}: Readonly<AccountInputProps>) {
  const { t } = useTranslation();
  const { accounts } = useAccounts();

  const groupedAccounts = useMemo(() => {
    const groups: Record<AccountTypeDto, AccountDto[]> = {
      [AccountTypeDto.CURRENT_ACCOUNT]: [],
      [AccountTypeDto.CREDIT_CARD]: [],
      [AccountTypeDto.SAVINGS]: [],
      [AccountTypeDto.INVESTMENT]: [],
      [AccountTypeDto.MORTGAGE]: [],
      [AccountTypeDto.LOAN]: [],
      [AccountTypeDto.PENSION]: [],
      [AccountTypeDto.UNKNOWN]: [],
    };

    for (const account of accounts) {
      const type = account.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(account);
    }

    return Object.entries(groups)
      .filter(([, items]) => items.length > 0)
      .map(([group, items]) => ({
        group: getAccountTypeTitle(group as AccountTypeDto),
        items,
      }));
  }, [accounts]);

  const selectedAccount = value
    ? (accounts.find((account) => account.id === value) ?? null)
    : null;

  return (
    <div className={className ? `grid gap-2 ${className}` : 'grid gap-2'}>
      <Label htmlFor={id}>
        {label || t('components.accountInput.label', 'Account')}
        {required ? ' *' : ''}
      </Label>

      {selectedAccount ? (
        <div className="flex items-center gap-2 rounded-md border px-2 py-1 text-sm">
          <AccountAvatar accountId={selectedAccount.id} size="sm" />
          <span className="truncate">{selectedAccount.name}</span>
        </div>
      ) : null}

      <select
        id={id}
        name={name}
        required={required}
        disabled={disabled}
        value={value ?? ''}
        onBlur={onBlur}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          onChange?.(nextValue === '' ? null : nextValue);
        }}
        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">
          {placeholder ||
            t('components.accountInput.placeholder', 'Select an account')}
        </option>

        {groupedAccounts.map((group) => (
          <optgroup key={group.group} label={group.group}>
            {group.items.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {groupedAccounts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t(
            'components.accountInput.nothingFoundMessage',
            'No accounts found',
          )}
        </p>
      ) : null}
    </div>
  );
}
