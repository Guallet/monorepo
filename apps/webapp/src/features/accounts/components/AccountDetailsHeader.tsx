import { AccountAvatar } from "@/components/AccountAvatar/AccountAvatar";
import { AmountLabel } from "@/components/Amount/AmountLabel";
import { getAccountTypeTitleSingular } from "../models/Account";
import { useAccount } from "@guallet/api-react";
import { ConnectedAccountStatus } from "./ConnectedAccountStatus";

interface AccountDetailsHeaderProps {
  accountId: string;
}
export function AccountDetailsHeader({
  accountId,
}: Readonly<AccountDetailsHeaderProps>) {
  const { account } = useAccount(accountId);
  if (!account) {
    return null;
  }

  return (
    <div className="flex items-start justify-between gap-3">
      <AccountAvatar accountId={accountId} showTooltip />

      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-lg font-bold">{account?.name}</p>
        <p className="text-sm text-muted-foreground">
          {getAccountTypeTitleSingular(account.type)}
        </p>
        {account.source === "synced" && (
          <ConnectedAccountStatus accountId={account.id} />
        )}
      </div>

      <AmountLabel
        amount={account.balance.amount}
        currencyCode={account.currency}
      />
    </div>
  );
}
