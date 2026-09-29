import { useLocalSearchParams } from 'expo-router';
import { ImportSubmittedScreen } from '@/features/importer/screens';

export default function CsvSubmittedRoute() {
  const { fileName, submitted, skipped } = useLocalSearchParams<{
    fileName?: string;
    submitted?: string;
    skipped?: string;
  }>();
  return (
    <ImportSubmittedScreen
      fileName={fileName}
      submitted={submitted}
      skipped={skipped}
    />
  );
}
