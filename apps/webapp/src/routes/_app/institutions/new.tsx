import { createFileRoute } from '@tanstack/react-router';
import { AddInstitutionScreen } from '@/features/institutions/screens/AddInstitutionScreen';

export const Route = createFileRoute('/_app/institutions/new')({
  component: AddInstitutionPage,
});

export function AddInstitutionPage() {
  return <AddInstitutionScreen />;
}
