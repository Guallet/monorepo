import { createContext, useContext, type ReactNode } from 'react';

export interface DateRangeSheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
}

export type DateRangeSheetRenderer = (props: DateRangeSheetProps) => ReactNode;

const SheetContext = createContext<DateRangeSheetRenderer | null>(null);

/** Connects the package control to the host app's native bottom sheet. */
export function DateRangeSheetProvider({
  sheet,
  children,
}: Readonly<{
  sheet: DateRangeSheetRenderer;
  children: ReactNode;
}>) {
  return (
    <SheetContext.Provider value={sheet}>{children}</SheetContext.Provider>
  );
}

export function useDateRangeSheet() {
  return useContext(SheetContext);
}
