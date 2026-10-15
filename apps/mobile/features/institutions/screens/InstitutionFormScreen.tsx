import { View } from 'react-native';
import { useInstitution } from '@guallet/api-react';
import { useTheme } from '@guallet/luna-mobile';
import { AppScreen } from '@/components/layout/AppScreen';
import { InstitutionState } from '../components/InstitutionUi';
import { InstitutionForm } from '../components/InstitutionForm';

export default function InstitutionFormScreen({
  institutionId,
}: Readonly<{ institutionId?: string }>) {
  const query = useInstitution(institutionId);
  const { spacing } = useTheme();
  if (institutionId && !query.institution) {
    let title = 'Institution unavailable';
    if (query.isLoading) title = 'Loading institution…';
    if (query.isError) title = 'Couldn’t load institution';
    return (
      <AppScreen
        headerTitle="Edit institution"
        safeAreaEdges={['left', 'right', 'bottom']}
      >
        <View style={{ padding: spacing.md }}>
          <InstitutionState
            title={title}
            loading={query.isLoading}
            action="Try again"
            onAction={() => void query.refetch()}
          />
        </View>
      </AppScreen>
    );
  }
  if (institutionId && typeof query.institution?.user_id !== 'string')
    return (
      <AppScreen
        headerTitle="Institution"
        safeAreaEdges={['left', 'right', 'bottom']}
      >
        <View style={{ padding: spacing.md }}>
          <InstitutionState
            title="Shared institution"
            body="Shared institution details cannot be edited."
          />
        </View>
      </AppScreen>
    );
  return (
    <InstitutionForm
      key={institutionId ?? 'new'}
      institution={query.institution ?? undefined}
    />
  );
}
