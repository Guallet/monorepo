import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAccounts, useSavingGoals } from '@guallet/api-react';
import { Button, useTheme } from '@guallet/luna-mobile';
import { SavingsIcon } from '@guallet/luna-mobile/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { GoalCard } from '../components/GoalCard';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { formatPreferenceDate } from '@/utils/formatPreferenceDate';
import { useTranslation } from 'react-i18next';

export default function SavingGoalsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { dateFormat } = useMobileUserPreferences();
  const { savingGoals, isLoading, isError, isRefetching, refetch } =
    useSavingGoals();
  const { accounts } = useAccounts();

  return (
    <AppScreen headerTitle={t('copy_1mvwpdf')}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.accent.primary}
          />
        }
      >
        <View style={styles.heading}>
          <View style={styles.headingText}>
            <Text
              accessibilityRole="header"
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.xxl,
                fontWeight: '700',
              }}
            >
              {t('copy_1mvwpdf')}
            </Text>
            <Text style={{ color: colors.text.secondary }}>
              {t('copy_ui00hb')}
            </Text>
          </View>
          <Button onClick={() => router.push('/saving-goals/new')}>
            {t('copy_17rv3f8')}
          </Button>
        </View>
        {isLoading &&
          [0, 1].map((index) => (
            <View
              key={index}
              accessibilityLabel={t('copy_10ppif7')}
              style={[
                styles.skeleton,
                {
                  backgroundColor: colors.surface.background.secondary,
                  borderRadius: borderRadius.lg,
                },
              ]}
            />
          ))}
        {!isLoading && isError && (
          <View
            style={[
              styles.message,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
              },
            ]}
          >
            <Text style={[styles.messageTitle, { color: colors.text.primary }]}>
              {t('copy_1f67ynb')}
            </Text>
            <Text style={{ color: colors.text.secondary }}>
              {t('copy_k8irws')}
            </Text>
            <Button onClick={() => void refetch()} variant="outline">
              {t('copy_982hh6')}
            </Button>
          </View>
        )}
        {!isLoading && !isError && savingGoals.length === 0 && (
          <View
            style={[
              styles.message,
              styles.empty,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
              },
            ]}
          >
            <SavingsIcon size={48} color={colors.text.secondary} />
            <Text style={[styles.messageTitle, { color: colors.text.primary }]}>
              {t('copy_mddyem')}
            </Text>
            <Text style={{ color: colors.text.secondary, textAlign: 'center' }}>
              {t('copy_257afu')}
            </Text>
            <Button onClick={() => router.push('/saving-goals/new')}>
              {t('copy_n3rlgp')}
            </Button>
          </View>
        )}
        {!isLoading &&
          !isError &&
          savingGoals.map((goal) => {
            const names = accounts
              .filter((account) => goal.accounts.includes(account.id))
              .map((account) => account.name)
              .join(', ');
            const deadline = goal.targetDate
              ? ` · ${formatPreferenceDate(goal.targetDate, dateFormat)}`
              : '';
            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                accountNames={`${names || `${goal.accounts.length} linked account${goal.accounts.length === 1 ? '' : 's'}`}${deadline}`}
                onPress={() => router.push(`/saving-goals/${goal.id}`)}
              />
            );
          })}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  headingText: { flex: 1, gap: 3 },
  skeleton: { height: 125 },
  message: { borderWidth: 1, gap: 12 },
  empty: {
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    marginTop: 20,
  },
  messageTitle: { fontSize: 20, fontWeight: '700' },
});
