import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_app/reports/')({
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="flex h-[calc(100dvh-92px)] flex-col gap-4">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Reports Page</h1>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <Link
            className="w-fit text-primary underline-offset-4 hover:underline"
            to="/reports/cashflow"
            search={{
              year: new Date().getUTCFullYear(),
            }}
          >
            Cashflow
          </Link>
        </div>
      </div>

      {/* Footer. Always at the bottom */}
      <div>
        <Button type="button">Button at the Bottom</Button>
      </div>
    </div>
  );
}
