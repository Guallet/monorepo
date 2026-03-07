import {
  IconCancel,
  IconCheck,
  IconClock,
  IconHourglassEmpty,
} from '@tabler/icons-react';
import React from 'react';

export function ConnectionStatusBadge({
  status,
}: Readonly<{
  status: string;
}>) {
  const colorClassName = getStatusClassName(status);

  return (
    <span
      title={getStatusTooltip(status)}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${colorClassName}`}
    >
      {getStatusIcon(status)}
      <span>{getStatusLabel(status)}</span>
    </span>
  );
}

function getStatusTooltip(status: string) {
  if (status === 'CR') return 'Requisition has been successfully created';
  if (status === 'GC')
    return "End-user is giving consent at GoCardless's consent screen";
  if (status === 'UA')
    return 'End-user is redirected to the financial institution for authentication';
  if (status === 'RJ')
    return 'Either SSN verification has failed or end-user has entered incorrect credentials';
  if (status === 'SA') return 'End-user is selecting accounts';
  if (status === 'GA')
    return 'End-user is granting access to their account information';
  if (status === 'LN')
    return 'Account has been successfully linked to requisition';
  if (status === 'EX')
    return 'Access to accounts has expired as set in End User Agreement';

  return status;
}

function getStatusLabel(status: string) {
  if (status === 'CR') return 'CREATED';
  if (status === 'GC') return 'GIVING_CONSENT';
  if (status === 'UA') return 'UNDERGOING_AUTHENTICATION';
  if (status === 'RJ') return 'REJECTED';
  if (status === 'SA') return 'SELECTING_ACCOUNTS';
  if (status === 'GA') return 'GRANTING_ACCESS';
  if (status === 'LN') return 'LINKED';
  if (status === 'EX') return 'EXPIRED';
  return status;
}

function getStatusClassName(status: string) {
  if (status === 'CR') return 'border-blue-200 bg-blue-50 text-blue-700';
  if (status === 'GC') return 'border-orange-200 bg-orange-50 text-orange-700';
  if (status === 'UA') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (status === 'RJ') return 'border-red-200 bg-red-50 text-red-700';
  if (status === 'SA') return 'border-purple-200 bg-purple-50 text-purple-700';
  if (status === 'GA') return 'border-blue-200 bg-blue-50 text-blue-700';
  if (status === 'LN')
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'EX') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-border bg-muted text-muted-foreground';
}

function getStatusIcon(status: string): React.ReactNode {
  if (status === 'CR') return <IconClock size={12} />;
  if (status === 'GC') return <IconHourglassEmpty size={12} />;
  if (status === 'UA') return <IconClock size={12} />;
  if (status === 'RJ') return <IconCancel size={12} />;
  if (status === 'SA') return <IconClock size={12} />;
  if (status === 'GA') return <IconCheck size={12} />;
  if (status === 'LN') return <IconCheck size={12} />;
  if (status === 'EX') return <IconHourglassEmpty size={12} />;
  return null;
}
