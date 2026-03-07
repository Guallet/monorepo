import { SearchBoxInput } from '@guallet/ui-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AccountsHeaderProps {
  onAddNewAccount: () => void;
  onSearchQueryChanged: (searchQuery: string) => void;
}

export function AccountsHeader({
  onAddNewAccount,
  onSearchQueryChanged,
}: Readonly<AccountsHeaderProps>) {
  const [query, setQuery] = useState('');

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchBoxInput
        style={{ flexGrow: 1 }}
        query={query}
        onSearchQueryChanged={(query) => {
          setQuery(query);
          onSearchQueryChanged(query);
        }}
      />
      <Button type="button" onClick={onAddNewAccount}>
        Add new account
      </Button>
    </div>
  );
}
