import { Money } from "@guallet/money";
import { Text, TextProps } from "@mantine/core";

interface AmountLabelProps extends TextProps {
  amount: number;
  currencyCode: string;
}

export function AmountLabel({
  amount,
  currencyCode,
  ...props
}: Readonly<AmountLabelProps>) {
  const money = Money.fromCurrencyCode({
    amount,
    currencyCode,
  });

  return (
    <Text size="lg" fw={700} {...props}>
      {money.format()}
    </Text>
  );
}
