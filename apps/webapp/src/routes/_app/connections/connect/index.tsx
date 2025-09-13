import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { z } from "zod";
import { ConnectionCreateScreen } from "@/features/connections/screens/ConnectionCreateScreen";
const pageSearchSchema = z.object({
  country: z.string().optional(),
});

export const Route = createFileRoute("/_app/connections/connect/")({
  component: AddConnectionPage,
  validateSearch: pageSearchSchema,
});

function AddConnectionPage() {
  const { country } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <ConnectionCreateScreen
      selectedCountryCode={country}
      onCountryChange={(country) => {
        navigate({
          search: (prev) => ({ ...prev, country: country?.code || undefined }),
        });
      }}
    />
  );
}
