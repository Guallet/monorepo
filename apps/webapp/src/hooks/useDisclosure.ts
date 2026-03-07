import { useCallback, useState } from 'react';

interface UseDisclosureHandlers {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useDisclosure(
  initialState = false,
): [boolean, UseDisclosureHandlers] {
  const [opened, setOpened] = useState<boolean>(initialState);

  const open = useCallback(() => {
    setOpened(true);
  }, []);

  const close = useCallback(() => {
    setOpened(false);
  }, []);

  const toggle = useCallback(() => {
    setOpened((currentState) => !currentState);
  }, []);

  return [opened, { open, close, toggle }];
}
