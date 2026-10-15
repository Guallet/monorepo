import { createFileRoute } from '@tanstack/react-router';
import { CsvImportStatusScreen } from '@/features/importer/importers/csv/screens/CsvImportStatusScreen';

export const Route = createFileRoute('/_app/importer/csv/status/$jobId')({
  component: ImportStatusRoute,
});

function ImportStatusRoute() {
  const { jobId } = Route.useParams();
  return <CsvImportStatusScreen jobId={jobId} />;
}
