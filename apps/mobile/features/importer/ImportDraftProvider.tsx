import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CsvDraft } from './csv';

interface ImportDraftContextValue {
  draft: CsvDraft | null;
  setDraft: (draft: CsvDraft | null) => void;
  updateDraft: (update: (draft: CsvDraft) => CsvDraft) => void;
}

const ImportDraftContext = createContext<ImportDraftContextValue | null>(null);

export function ImportDraftProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [draft, setDraft] = useState<CsvDraft | null>(null);
  const value = useMemo<ImportDraftContextValue>(
    () => ({
      draft,
      setDraft,
      updateDraft: (update) =>
        setDraft((current) => (current ? update(current) : null)),
    }),
    [draft],
  );
  return (
    <ImportDraftContext.Provider value={value}>
      {children}
    </ImportDraftContext.Provider>
  );
}

export function useImportDraft() {
  const context = useContext(ImportDraftContext);
  if (!context) throw new Error('Import draft provider is missing');
  return context;
}
