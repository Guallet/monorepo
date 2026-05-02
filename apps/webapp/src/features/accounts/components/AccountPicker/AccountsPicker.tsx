import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AccountDto } from '@guallet/api-client';
import { ResponsiveModal } from '@guallet/ui-react';
import { useAccounts } from '@guallet/api-react';
import { AccountPickerModal } from './AccountPickerModal';

interface AccountsPickerProps {
  selectedAccounts: AccountDto[];
  onSelectedAccountsChange: (accounts: AccountDto[]) => void;
}

export function AccountsPicker({
  selectedAccounts,
  onSelectedAccountsChange,
}: Readonly<AccountsPickerProps>) {
  const { accounts } = useAccounts();

  const [opened, { open, close }] = useDisclosure(false);

  let buttonCaption: string;
  switch (selectedAccounts.length) {
    case 0:
      buttonCaption = 'Select accounts';
      break;
    case 1:
      buttonCaption = `${selectedAccounts[0].name} selected`;
      break;
    case accounts.length:
      buttonCaption = `All accounts selected`;
      break;
    default:
      buttonCaption = `${selectedAccounts.length} accounts selected`;
  }

  return (
    <>
      <ResponsiveModal
        opened={opened}
        onClose={close}
        title="Select accounts"
        size="auto"
      >
        <AccountPickerModal
          accounts={accounts}
          selectedAccounts={selectedAccounts}
          onSelectAccounts={(selected) => {
            onSelectedAccountsChange(selected);
            close();
          }}
          onCancel={close}
        />
      </ResponsiveModal>
      <Button variant="outline" onClick={open}>
        {buttonCaption}
      </Button>
    </>
  );
}
