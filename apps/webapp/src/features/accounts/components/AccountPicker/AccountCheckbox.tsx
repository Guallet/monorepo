import { AccountAvatar } from '@/components/AccountAvatar/AccountAvatar';
import { AccountDto } from '@guallet/api-client';

interface AccountCheckboxProps {
  account: AccountDto;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function AccountCheckbox({
  account,
  checked,
  onCheckedChange,
}: Readonly<AccountCheckboxProps>) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors hover:bg-accent ${
        checked ? 'border-primary bg-primary/5' : 'border-input'
      }`}
      onClick={() => {
        onCheckedChange(!checked);
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        readOnly
        tabIndex={-1}
        className="h-4 w-4"
      />

      <AccountAvatar accountId={account.id} />

      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {account.name}
      </span>
    </button>
  );
}
