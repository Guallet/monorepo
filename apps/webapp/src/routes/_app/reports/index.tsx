import { FileRoute, Link } from "@tanstack/react-router";

export const Route = new FileRoute("/_app/reports/").createRoute({
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
