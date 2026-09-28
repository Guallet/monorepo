export interface AccountPickerItem {
  id: string;
  name: string;
  type: string;
}

export interface AccountGroup {
  type: string;
  title: string;
  items: AccountPickerItem[];
}

const TYPE_LABELS: Record<string, string> = {
  'current-account': 'Current accounts',
  'savings-account': 'Savings accounts',
  'credit-card': 'Credit cards',
  investment: 'Investments',
  mortgage: 'Mortgages',
  loan: 'Loans',
  pension: 'Pensions',
  unknown: 'Other accounts',
};

const TYPE_ORDER = Object.keys(TYPE_LABELS);

/** Filter names locally while retaining account type sections. */
export function groupAccounts(
  accounts: AccountPickerItem[],
  query: string,
): AccountGroup[] {
  const search = query.trim().toLocaleLowerCase();
  const groups = new Map<string, AccountPickerItem[]>();
  for (const account of accounts) {
    if (search && !account.name.toLocaleLowerCase().includes(search)) continue;
    const group = groups.get(account.type) ?? [];
    group.push(account);
    groups.set(account.type, group);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => {
      const aOrder = TYPE_ORDER.indexOf(a);
      const bOrder = TYPE_ORDER.indexOf(b);
      if (aOrder === -1 && bOrder === -1) return a.localeCompare(b);
      if (aOrder === -1) return 1;
      if (bOrder === -1) return -1;
      return aOrder - bOrder;
    })
    .map(([type, items]) => ({
      type,
      title: TYPE_LABELS[type] ?? 'Other accounts',
      items,
    }));
}

export function accountInputLabel(
  accounts: AccountPickerItem[],
  value: string | string[] | null,
  selectionMode: 'single' | 'multiple',
  placeholder: string,
): string {
  if (selectionMode === 'single') {
    if (typeof value !== 'string') return placeholder;
    return (
      accounts.find((account) => account.id === value)?.name ?? placeholder
    );
  }
  const selected = Array.isArray(value) ? value : [];
  const count = selected.length;
  if (count === 0) return placeholder;
  if (count === 1) {
    return (
      accounts.find((account) => account.id === selected[0])?.name ??
      '1 account selected'
    );
  }
  return `${count} accounts selected`;
}
