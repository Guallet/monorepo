import { MonthSelector } from '@guallet/luna-mobile';
import { MIN_BUDGET_YEAR } from '../models';

interface BudgetMonthSelectorProps {
  date: Date;
  onChange: (date: Date) => void;
}

/** Budget screens share the bounded Luna control and the current month limit. */
export function BudgetMonthSelector({
  date,
  onChange,
}: Readonly<BudgetMonthSelectorProps>) {
  return (
    <MonthSelector
      value={date}
      onChange={onChange}
      minDate={new Date(MIN_BUDGET_YEAR, 0, 1)}
      maxDate={new Date()}
    />
  );
}
