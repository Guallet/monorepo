import svgLogo from '@/assets/guallet.svg';
import { cn } from '@/lib/utils';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: string | number;
}

export function GualletLogo({
  size = 40,
  className,
  style,
  alt = 'Guallet logo',
  ...props
}: Readonly<Props>) {
  return (
    <img
      {...props}
      src={svgLogo}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-md object-fill', className)}
      style={{ width: size, height: size, ...style }}
    />
  );
}
