import { useMediaQuery } from "@mantine/hooks";

/**
 * Mobile breakpoint used for responsive detection
 * Value of 50em is equivalent to 800px
 */
export const MOBILE_BREAKPOINT = "50em";

/**
 * Hook to detect if the current viewport is mobile-sized
 * Uses Mantine's media query hook with a breakpoint of 50em (800px)
 * 
 * @returns {boolean} true if viewport width is <= 50em, false otherwise
 */
export function useIsMobile(): boolean {
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT})`);
  return isMobile;
}
