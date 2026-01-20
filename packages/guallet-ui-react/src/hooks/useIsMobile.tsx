import { useMediaQuery } from "@mantine/hooks";

/**
 * Hook to detect if the current viewport is mobile-sized
 * Uses Mantine's media query hook with a breakpoint of 50em (800px)
 * 
 * @returns {boolean} true if viewport width is <= 50em, false otherwise
 */
export function useIsMobile(): boolean {
  const isMobile = useMediaQuery("(max-width: 50em)");
  return isMobile;
}
