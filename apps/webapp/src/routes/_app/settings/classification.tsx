import { createFileRoute } from '@tanstack/react-router';
import { ClassificationSettingsScreen } from '@/features/classification/screens/ClassificationSettingsScreen';
export const Route = createFileRoute('/_app/settings/classification')({
  component: ClassificationSettingsScreen,
});
