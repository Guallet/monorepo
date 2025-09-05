import { useMediaQuery } from "@mantine/hooks";

export function useIsMobile() {
  const isMobile = useMediaQuery("(max-width: 50em)");
  return isMobile;
}
