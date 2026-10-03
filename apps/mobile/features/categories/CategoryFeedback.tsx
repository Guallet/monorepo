import { createContext, useContext, useState, type ReactNode } from 'react';

export type CategoryFeedback = {
  message: string;
  categoryId?: string;
  parentId?: string | null;
};

const Context = createContext<{
  feedback: CategoryFeedback | null;
  setFeedback: (feedback: CategoryFeedback | null) => void;
} | null>(null);

export function CategoryFeedbackProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [feedback, setFeedback] = useState<CategoryFeedback | null>(null);
  return (
    <Context.Provider value={{ feedback, setFeedback }}>
      {children}
    </Context.Provider>
  );
}

export function useCategoryFeedback() {
  const context = useContext(Context);
  if (!context) throw new Error('Category feedback requires its provider');
  return context;
}
