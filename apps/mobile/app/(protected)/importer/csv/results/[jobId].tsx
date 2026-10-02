import { useLocalSearchParams } from 'expo-router';
import { ImportResultsScreen } from '@/features/importer/screens';

export default function CsvResultsRoute() {
  const { jobId, fileName, submitted, skipped } = useLocalSearchParams<{
    jobId: string;
    fileName?: string;
    submitted?: string;
    skipped?: string;
  }>();
  return (
    <ImportResultsScreen
      jobId={jobId}
      fileName={fileName}
      submitted={submitted}
      skipped={skipped}
    />
  );
}
