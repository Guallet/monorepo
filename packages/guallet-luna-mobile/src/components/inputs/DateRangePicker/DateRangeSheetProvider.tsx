import { createContext, useContext, type ReactNode } from 'react';

export interface DateRangeSheetProps {
  visible: boolean;
  title: string;
  showCloseIcon?: boolean;
  onDismiss: () => void;
  children: ReactNode;
  snapPoints?: ('half' | 'full')[];
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

/** Read the app-supplied sheet renderer used by the reusable picker. */
export function useDateRangeSheet() {
  return useContext(SheetContext);
}

/** Generic name for pickers sharing the host app's native sheet adapter. */
export const usePickerSheet = useDateRangeSheet;
export const PickerSheetProvider = DateRangeSheetProvider;
