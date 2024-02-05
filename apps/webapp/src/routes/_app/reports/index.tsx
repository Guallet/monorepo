import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/reports/")({
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div>
      <h1>Reports Page</h1>
      <Link
        to="/reports/cashflow"
        search={{
          year: new Date().getUTCFullYear(),
        }}
      >
        Cashflow
      </Link>
    </div>
  );
}
