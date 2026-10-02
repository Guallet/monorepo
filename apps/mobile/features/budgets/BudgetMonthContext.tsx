import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getMonthStart } from './models';

type BudgetMonthContextValue = {
  selectedDate: Date;
  selectMonth: (date: Date) => void;
};

const BudgetMonthContext = createContext<BudgetMonthContextValue | null>(null);

export function BudgetMonthProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [selectedDate, setSelectedDate] = useState(() =>
    getMonthStart(new Date()),
  );

  const value = useMemo(
    () => ({
      selectedDate,
      selectMonth: (date: Date) => setSelectedDate(getMonthStart(date)),
    }),
    [selectedDate],
  );

  return (
    <BudgetMonthContext.Provider value={value}>
      {children}
    </BudgetMonthContext.Provider>
  );
}

export function useBudgetMonth() {
  const context = useContext(BudgetMonthContext);
  if (!context) {
    throw new Error('useBudgetMonth requires BudgetMonthProvider.');
  }
  return context;
}
