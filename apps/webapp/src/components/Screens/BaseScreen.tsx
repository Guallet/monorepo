import { Colors } from '@/theme/colors';
import { ReactNode } from 'react';

interface BaseScreenProps {
  isLoading?: boolean;
  children: ReactNode;
  fullScreen?: boolean;
}

export function BaseScreen({
  children,
  isLoading = false,
  fullScreen = false,
}: Readonly<BaseScreenProps>) {
  return (
    <div
      className="relative"
      style={{
        backgroundColor: Colors.pageBackground,
        minHeight: fullScreen ? '100dvh' : undefined,
        minWidth: fullScreen ? '100dvw' : undefined,
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <output className="sr-only">Loading</output>
          <div
            aria-hidden="true"
            className="h-8 w-8 animate-spin rounded-full border-4"
            style={{
              borderColor: `${Colors.primary} ${Colors.primary} transparent ${Colors.primary}`,
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
}
