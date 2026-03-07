import { Money } from '@guallet/money';
import { cn } from '@/lib/utils';

interface AmountLabelProps extends React.HTMLAttributes<HTMLParagraphElement> {
  amount: number;
  currencyCode: string;
}

export function AmountLabel({
  amount,
  currencyCode,
  className,
  ...props
}: Readonly<AmountLabelProps>) {
  const money = Money.fromCurrencyCode({
    amount,
    currencyCode,
  });

  return (
    <p className={cn('text-lg font-bold', className)} {...props}>
      {money.format()}
    </p>
  );
}
