import { useMediaQuery } from '@mantine/hooks';
import { useTheme } from './useTheme';

export function useIsMobile(): boolean {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.sm})`);
  return isMobile;
}
