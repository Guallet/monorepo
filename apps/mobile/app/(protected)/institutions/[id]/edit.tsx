import { useLocalSearchParams } from 'expo-router';
import InstitutionFormScreen from '@/features/institutions/screens/InstitutionFormScreen';
export default function EditInstitutionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <InstitutionFormScreen institutionId={id} />;
}
