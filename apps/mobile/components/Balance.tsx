import { Label, useTheme } from '@luna-ui/react-native';
import { Money } from '@guallet/money';

interface BalanceProps
  extends Omit<React.ComponentProps<typeof Label>, 'children'> {
  balance: { amount: number; currency: string };
}

export function Balance({ balance, ...props }: Readonly<BalanceProps>) {
  const amount = Money.fromCurrencyCode({
    amount: balance.amount,
    currencyCode: balance.currency,
  });

  const { colors, typography } = useTheme();
  return <Label {...props}>{amount.format()}</Label>;
}
