import type { ReactNode } from 'react';
import { toast, type ExternalToast } from 'sonner';

export interface NotificationPayload {
  title?: ReactNode;
  message?: ReactNode;
  color?: string;
  icon?: ReactNode;
  id?: string | number;
  autoClose?: boolean | number;
  loading?: boolean;
  withBorder?: boolean;
  withCloseButton?: boolean;
  [key: string]: unknown;
}

function getDuration(autoClose: NotificationPayload['autoClose']) {
  if (typeof autoClose === 'number') {
    return autoClose;
  }

  if (autoClose === false) {
    return Number.POSITIVE_INFINITY;
  }

  return undefined;
}

function getVariant(color?: string) {
  switch (color) {
    case 'green':
    case 'teal':
    case 'lime':
      return 'success';
    case 'red':
    case 'pink':
      return 'error';
    case 'orange':
    case 'yellow':
      return 'warning';
    case 'blue':
    case 'cyan':
      return 'info';
    default:
      return 'default';
  }
}

function show(payload: NotificationPayload) {
  const { title, message, color, autoClose, loading, ...rest } = payload;
  const content = title ?? message ?? 'Notification';

  const options: ExternalToast = {
    ...(rest as ExternalToast),
    duration: getDuration(autoClose),
    description: title && message ? message : undefined,
  };

  if (loading) {
    return toast.loading(content, options);
  }

  switch (getVariant(color)) {
    case 'success':
      return toast.success(content, options);
    case 'error':
      return toast.error(content, options);
    case 'warning':
      return toast.warning(content, options);
    case 'info':
      return toast.info(content, options);
    default:
      return toast(content, options);
  }
}

export const notifications = {
  show,
  update: show,
  hide: (id: string | number) => toast.dismiss(id),
  clean: () => toast.dismiss(),
  cleanQueue: () => toast.dismiss(),
};
