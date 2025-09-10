import { createFileRoute } from "@tanstack/react-router";

import { z } from "zod";
import { ConnectionCallbackScreen } from "@/features/connections/screens/ConnectionCallbackScreen";

const pageSearchSchema = z.object({
  ref: z.string().optional().nullable(),
  error: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
});

export const Route = createFileRoute("/_app/connections/connect/callback")({
  component: ConnectionCallbackPage,
  validateSearch: pageSearchSchema,
});

function ConnectionCallbackPage() {
  const { ref, error, details } = Route.useSearch();
  return (
    <ConnectionCallbackScreen
      connectionId={ref}
      error={error}
      details={details}
    />
  );
}
