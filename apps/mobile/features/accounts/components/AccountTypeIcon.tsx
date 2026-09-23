import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AccountTypeDto } from '@guallet/api-client';
import type { ComponentProps } from 'react';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const ICONS: Record<AccountTypeDto, MaterialIconName> = {
  [AccountTypeDto.CURRENT_ACCOUNT]: 'account-balance',
  [AccountTypeDto.SAVINGS]: 'savings',
  [AccountTypeDto.CREDIT_CARD]: 'credit-card',
  [AccountTypeDto.INVESTMENT]: 'insert-chart',
  [AccountTypeDto.MORTGAGE]: 'home',
  [AccountTypeDto.LOAN]: 'receipt-long',
  [AccountTypeDto.PENSION]: 'work',
  [AccountTypeDto.UNKNOWN]: 'help-outline',
};

export function AccountTypeIcon({
  type,
  color,
  size = 20,
}: Readonly<{
  type: AccountTypeDto;
  color?: string;
  size?: number;
}>) {
  return (
    <MaterialIcons
      color={color}
      name={ICONS[type] ?? 'help-outline'}
      size={size}
    />
  );
}
