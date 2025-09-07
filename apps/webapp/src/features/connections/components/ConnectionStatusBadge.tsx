import { Badge, Tooltip } from "@mantine/core";
import {
  IconCancel,
  IconCheck,
  IconClock,
  IconHourglassEmpty,
} from "@tabler/icons-react";
import React from "react";

export function ConnectionStatusBadge({
  status,
}: Readonly<{
  status: string;
}>) {
  return (
    <Tooltip label={getStatusTooltip(status)} withArrow>
      <Badge
        variant="light"
        leftSection={getStatusIcon(status)}
        color={getStatusColor(status)}
      >
        {getStatusLabel(status)}
      </Badge>
    </Tooltip>
  );
}

function getStatusTooltip(status: string) {
  if (status === "CR") return "Requisition has been successfully created";
  if (status === "GC")
    return "End-user is giving consent at GoCardless's consent screen";
  if (status === "UA")
    return "End-user is redirected to the financial institution for authentication";
  if (status === "RJ")
    return "Either SSN verification has failed or end-user has entered incorrect credentials";
  if (status === "SA") return "End-user is selecting accounts";
  if (status === "GA")
    return "End-user is granting access to their account information";
  if (status === "LN")
    return "Account has been successfully linked to requisition";
  if (status === "EX")
    return "Access to accounts has expired as set in End User Agreement";

  return status;
}

function getStatusLabel(status: string) {
  if (status === "CR") return "CREATED";
  if (status === "GC") return "GIVING_CONSENT";
  if (status === "UA") return "UNDERGOING_AUTHENTICATION";
  if (status === "RJ") return "REJECTED";
  if (status === "SA") return "SELECTING_ACCOUNTS";
  if (status === "GA") return "GRANTING_ACCESS";
  if (status === "LN") return "LINKED";
  if (status === "EX") return "EXPIRED";
  return status;
}

function getStatusColor(status: string) {
  if (status === "CR") return "blue";
  if (status === "GC") return "orange";
  if (status === "UA") return "yellow";
  if (status === "RJ") return "red";
  if (status === "SA") return "purple";
  if (status === "GA") return "blue";
  if (status === "LN") return "green";
  if (status === "EX") return "red";
  return status;
}

function getStatusIcon(status: string): React.ReactNode {
  if (status === "CR") return <IconClock size={12} />;
  if (status === "GC") return <IconHourglassEmpty size={12} />;
  if (status === "UA") return <IconClock size={12} />;
  if (status === "RJ") return <IconCancel size={12} />;
  if (status === "SA") return <IconClock size={12} />;
  if (status === "GA") return <IconCheck size={12} />;
  if (status === "LN") return <IconCheck size={12} />;
  if (status === "EX") return <IconHourglassEmpty size={12} />;
  return status;
}
