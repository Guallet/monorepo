import { useIsMobile } from '../hooks/useIsMobile';
import React from 'react';
import { createPortal } from 'react-dom';

/**
 * Props for the ResponsiveModal component
 */
export interface ResponsiveModalProps {
  /** Whether the modal is currently open */
  opened: boolean;
  /** Callback function when the modal is closed */
  onClose: () => void;
  /** Optional title for the modal */
  title?: React.ReactNode;
  /** Content to be displayed in the modal */
  children: React.ReactNode;
  /** Size of the modal (only applies on desktop) */
  size?: string | number;
  /** Whether to show the close button (default: true) */
  withCloseButton?: boolean;
}

/**
 * ResponsiveModal - A reusable modal component that adapts to screen size
 *
 * This component renders a lightweight portal dialog with responsive behavior:
 * - On mobile devices (viewport <= 50em): Displays as a full-screen modal
 * - On desktop/tablet: Displays as a standard centered modal
 *
 * @example
 * ```tsx
 * import { ResponsiveModal } from '@guallet/ui-react';
 * import { useState } from 'react';
 *
 * function MyComponent() {
 *   const [opened, setOpened] = useState(false);
 *
 *   return (
 *     <>
 *       <button type="button" onClick={() => setOpened(true)}>Open Modal</button>
 *       <ResponsiveModal
 *         opened={opened}
 *         onClose={() => setOpened(false)}
 *         title="My Modal Title"
 *         size="md"
 *       >
 *         <p>Modal content goes here</p>
 *       </ResponsiveModal>
 *     </>
 *   );
 * }
 * ```
 *
 * @param props - Component props
 * @returns React component
 */
export function ResponsiveModal({
  opened,
  onClose,
  title,
  children,
  size = 'md',
  withCloseButton = true,
}: Readonly<ResponsiveModalProps>) {
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (
      !opened ||
      typeof document === 'undefined' ||
      globalThis.addEventListener === undefined
    ) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      globalThis.removeEventListener('keydown', handleKeyDown);
    };
  }, [opened, onClose]);

  if (!opened || typeof document === 'undefined') {
    return null;
  }

  const modalWidth = resolveModalWidth(size);

  return createPortal(
    <div
      style={{
        alignItems: isMobile ? 'stretch' : 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        inset: 0,
        justifyContent: 'center',
        padding: isMobile ? 0 : '1rem',
        position: 'fixed',
        zIndex: 1100,
      }}
    >
      <button
        aria-label="Close modal"
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
          inset: 0,
          position: 'fixed',
        }}
        type="button"
      />

      <dialog
        aria-label={typeof title === 'string' ? title : undefined}
        open
        style={{
          backgroundColor: 'var(--background, #ffffff)',
          border: 0,
          borderRadius: isMobile ? 0 : '0.75rem',
          boxShadow: '0 30px 60px rgba(2, 6, 23, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? '100dvh' : 'auto',
          margin: 0,
          maxHeight: isMobile ? '100dvh' : 'min(90dvh, 1000px)',
          maxWidth: isMobile ? '100%' : 'min(95vw, 1000px)',
          overflow: 'hidden',
          position: 'relative',
          width: isMobile ? '100%' : modalWidth,
          zIndex: 1,
        }}
      >
        {(title || withCloseButton) && (
          <header
            style={{
              alignItems: 'center',
              borderBottom: '1px solid rgba(148, 163, 184, 0.25)',
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'space-between',
              minHeight: '3.25rem',
              padding: '0.75rem 1rem',
            }}
          >
            <div style={{ fontWeight: 600 }}>{title}</div>
            {withCloseButton && (
              <button
                aria-label="Close modal"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 0,
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  lineHeight: 1,
                  padding: '0.125rem 0.375rem',
                }}
                type="button"
              >
                x
              </button>
            )}
          </header>
        )}

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '1rem' : '1.25rem',
          }}
        >
          {children}
        </div>
      </dialog>
    </div>,
    document.body,
  );
}

function resolveModalWidth(size: string | number): string {
  if (typeof size === 'number') {
    return `${size}px`;
  }

  switch (size) {
    case 'xs':
      return '20rem';
    case 'sm':
      return '24rem';
    case 'md':
      return '32rem';
    case 'lg':
      return '40rem';
    case 'xl':
      return '48rem';
    case 'auto':
      return 'fit-content';
    default:
      return size;
  }
}
