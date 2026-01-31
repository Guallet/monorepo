import { Modal, ModalProps } from '@mantine/core';
import { useIsMobile } from '../hooks/useIsMobile';
import React from 'react';

/**
 * Props for the ResponsiveModal component
 */
export interface ResponsiveModalProps extends ModalProps {
  /** Whether the modal is currently open */
  opened: boolean;
  /** Callback function when the modal is closed */
  onClose: () => void;
  /** Optional title for the modal */
  title?: React.ReactNode;
  /** Content to be displayed in the modal */
  children: React.ReactNode;
}

/**
 * ResponsiveModal - A reusable modal component that adapts to screen size
 *
 * This component wraps Mantine's Modal and provides responsive behavior:
 * - On mobile devices (viewport <= 50em): Displays as a full-screen modal
 * - On desktop/tablet: Displays as a standard centered modal
 *
 * @example
 * ```tsx
 * import { ResponsiveModal } from '@guallet/ui-react';
 * import { useDisclosure } from '@mantine/hooks';
 * import { Button } from '@mantine/core';
 *
 * function MyComponent() {
 *   const [opened, { open, close }] = useDisclosure(false);
 *
 *   return (
 *     <>
 *       <Button onClick={open}>Open Modal</Button>
 *       <ResponsiveModal
 *         opened={opened}
 *         onClose={close}
 *         title="My Modal Title"
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
  ...props
}: Readonly<ResponsiveModalProps>) {
  const isMobile = useIsMobile();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      fullScreen={isMobile}
      radius={isMobile ? 0 : undefined}
      padding={isMobile ? 'md' : undefined}
      centered
      {...props}
    >
      {children}
    </Modal>
  );
}
