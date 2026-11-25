import { Button, ScrollArea, Stack } from '@mantine/core';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_app/reports/')({
  component: ReportsPage,
});

function ReportsPage() {
  const { t } = useTranslation();

  return (
    <Stack style={{ height: 'calc(100dvh - 92px)' }}>
      {/* HEADER */}
      <Stack>
        <h1>Reports Page</h1>
      </Stack>

      {/* MAIN CONTENT */}
      <ScrollArea
        style={{
          flexGrow: 1,
        }}
      >
        <Stack>
          <Link
            to="/reports/cashflow"
            search={{
              year: new Date().getUTCFullYear(),
            }}
          >
            Cashflow
          </Link>
          <Link to="/reports/money-flow">
            {t('screens.reports.moneyFlow.title', 'Money flow')}
          </Link>
        </Stack>
      </ScrollArea>

      {/* Footer. Always at the bottom */}
      <Stack>
        <Button>Button at the Bottom</Button>
      </Stack>
    </Stack>
  );
}
