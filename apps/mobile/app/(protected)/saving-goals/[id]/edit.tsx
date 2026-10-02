import { useLocalSearchParams, useRouter } from 'expo-router';
import { ApiError } from '@guallet/api-client';
import { useSavingGoal } from '@guallet/api-react';
import { Button, useTheme } from '@guallet/luna-mobile';
import { Text, View } from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { GoalForm } from '@/features/saving-goals/components/GoalForm';
import { useTranslation } from 'react-i18next';

export default function EditSavingGoalScreen() {
  const { t } = useTranslation();
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  let id = rawId ?? '';
  if (Array.isArray(id)) id = id[0] ?? '';
  const router = useRouter();
  const { colors, spacing, typography } = useTheme();
  const { savingGoal, isLoading, isError, error, refetch } = useSavingGoal(id);
  if (
    !isLoading &&
    isError &&
    !(error instanceof ApiError && error.status === 404)
  ) {
    return (
      <AppScreen headerTitle={t('copy_12urhkc')}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
            padding: spacing.lg,
          }}
        >
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
            }}
          >
            {t('copy_1hlm9ke')}
          </Text>
          <Button onClick={() => void refetch()} variant="outline">
            {t('copy_982hh6')}
          </Button>
        </View>
      </AppScreen>
    );
  }
  if (isLoading) {
    return (
      <AppScreen
        headerTitle={t('copy_12urhkc')}
        isLoading
        loadingMessage={t('copy_1h4lsio')}
      />
    );
  }
  if (!savingGoal) {
    return (
      <AppScreen headerTitle={t('copy_12urhkc')}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
          }}
        >
          <Text style={{ color: colors.text.primary }}>{t('copy_9f54c7')}</Text>
          <Button onClick={() => router.back()} variant="outline">
            {t('copy_rcg61q')}
          </Button>
        </View>
      </AppScreen>
    );
  }
  return (
    <AppScreen headerTitle={t('copy_12urhkc')}>
      <GoalForm goal={savingGoal} onSaved={() => router.back()} />
    </AppScreen>
  );
}
