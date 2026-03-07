import { IconChevronRight } from '@tabler/icons-react';
import { Money } from '@guallet/money';
import { AccountDto } from '@guallet/api-client';
import { InstitutionLogo } from '@/components/InstitutionLogo/InstitutionLogo';

interface Props {
  account: AccountDto;
  onClick?: () => void;
}

export function AccountRow({ account, onClick }: Readonly<Props>) {
  const money = Money.fromCurrencyCode({
    amount: account.balance.amount,
    currencyCode: account.currency,
  });

  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 px-2 py-3 text-left hover:bg-accent"
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
    >
      <InstitutionLogo
        radius="xl"
        size={50}
        institutionId={account.institutionId}
      />
      <span className="flex-1">{account.name}</span>
      <span className="font-semibold">{money.format()}</span>

      <IconChevronRight className="h-4 w-4" stroke={2} />
    </button>
  );
}
