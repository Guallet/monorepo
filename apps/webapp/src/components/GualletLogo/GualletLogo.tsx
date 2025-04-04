import { Image } from "@mantine/core";
import svgLogo from "@/assets/guallet.svg";

interface Props extends React.ComponentPropsWithoutRef<typeof Image> {
  size?: string | number;
}

export function GualletLogo({ size = 40, ...props }: Readonly<Props>) {
  return (
    <Image
      {...props}
      src={svgLogo}
      radius="md"
      h={size}
      w={size}
      fit="fill"
      alt="Guallet logo"
    />
  );
}
