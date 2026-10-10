import { useState } from 'react';
import { View } from 'react-native';
import type { NotificationDto } from '@guallet/api-client';
import { BottomSheet, useTheme } from '@guallet/luna-mobile';
import { NotificationAction, NotificationText } from './NotificationUi';

/** The owner mounts this for one selected notification and unmounts on close. */
export function NotificationOptionsSheet({
  notification,
  onClose,
  onSetRead,
  onDelete,
  pending,
  confirmDelete = false,
}: Readonly<{
  notification: NotificationDto;
  onClose: () => void;
  onSetRead: () => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  pending: boolean;
  confirmDelete?: boolean;
}>) {
  const { spacing } = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [confirming, setConfirming] = useState(confirmDelete);
  let title = 'Notification options';
  let readLabel = 'Mark as read';
  if (notification.isRead) readLabel = 'Mark as unread';
  if (confirming) title = 'Delete notification?';
  function close() {
    setIsOpen(false);
    onClose();
  }
  async function updateRead() {
    if (await onSetRead()) close();
  }
  async function remove() {
    if (await onDelete()) close();
  }
  return (
    <BottomSheet
      isOpen={isOpen}
      title={title}
      showCloseIcon
      contentPadding={0}
      onClose={close}
    >
      <View
        style={{
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          gap: spacing.sm,
        }}
      >
        {confirming && (
          <View style={{ gap: spacing.sm }}>
            <NotificationText>
              This notification will be permanently removed.
            </NotificationText>
            <NotificationAction
              label="Delete"
              destructive
              disabled={pending}
              onPress={() => void remove()}
            />
            <NotificationAction
              label="Cancel"
              disabled={pending}
              onPress={close}
            />
          </View>
        )}
        {!confirming && (
          <View style={{ gap: spacing.sm }}>
            <NotificationAction
              label={readLabel}
              disabled={pending}
              onPress={() => void updateRead()}
            />
            <NotificationAction
              label="Delete notification"
              destructive
              disabled={pending}
              onPress={() => setConfirming(true)}
            />
          </View>
        )}
      </View>
    </BottomSheet>
  );
}
