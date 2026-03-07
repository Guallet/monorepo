import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onClick?: () => void;
}

export function BaseButton({
  children,
  onClick,
  className,
  type = 'button',
  disabled,
  ...props
}: Readonly<Props>) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      onClick={onClick}
      disabled={disabled ?? onClick == null}
      {...props}
    >
      {children}
    </button>
  );
}
