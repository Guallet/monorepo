import { useAccounts } from "@/features/accounts/useAccounts";
import { AccountDto } from "@guallet/api-client";
import { BasePicker } from "../BasePicker";
import { AccountRow } from "./AccountRow";

interface AccountPickerProps {
  account: AccountDto | null;
  onAccountSelected: (account: AccountDto | null) => void;
}
export function AccountPicker({
  account,
  onAccountSelected,
}: AccountPickerProps) {
  const { accounts } = useAccounts();

  return (
    <BasePicker
      items={accounts}
      selectedItem={account}
      placeholder="Select account"
      modalTitle="Select account"
      renderButton={(item: AccountDto) => {
        return <AccountRow account={item} displayBalance={false} />;
      }}
      renderItem={(item: AccountDto) => {
        return <AccountRow account={item} />;
      }}
      onItemSelected={(item: AccountDto | null) => {
        onAccountSelected(item);
      }}
    />
  );
}
