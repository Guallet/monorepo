import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSavingGoals } from '@guallet/api-react';
import { useTheme } from '@guallet/luna-mobile';
import { SavingGoalProgressItem } from './SavingGoalProgressItem';
import { useTranslation } from 'react-i18next';

const MAX_GOALS = 3;

export function SavingGoalsWidget() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, borderRadius, spacing, typography } = useTheme();
  const { savingGoals, isLoading, isError } = useSavingGoals();

  if (isLoading) {
    return (
      <View
        style={[
          styles.skeleton,
          {
            borderRadius: borderRadius.lg,
            backgroundColor: colors.surface.background.secondary,
          },
        ]}
      />
    );
  }

  const goals = savingGoals.slice(0, MAX_GOALS);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.background.primary,
          borderRadius: borderRadius.lg,
          borderColor: colors.surface.border.primary,
          padding: spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: colors.text.primary, fontSize: typography.sizes.lg },
          ]}
        >
          {t('copy_1mvwpdf')}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('copy_1b0yevb')}
          onPress={() => router.push('/saving-goals')}
          style={styles.link}
        >
          <Text style={{ color: colors.accent.primary, fontWeight: '600' }}>
            {t('copy_19mqy9f')}
          </Text>
        </Pressable>
      </View>

      {isError && (
        <Text style={{ color: colors.text.secondary }}>{t('copy_ubksqv')}</Text>
      )}
      {!isError && goals.length === 0 ? (
        <Text
          style={[
            styles.emptyText,
            { color: colors.text.secondary, fontSize: typography.sizes.sm },
          ]}
        >
          {t('copy_tpgb2h')}
        </Text>
      ) : (
        !isError &&
        goals.map((goal) => (
          <Pressable
            key={goal.id}
            accessibilityRole="button"
            accessibilityLabel={t('View {{name}} goal', { name: goal.name })}
            onPress={() => router.push(`/saving-goals/${goal.id}`)}
          >
            <SavingGoalProgressItem goal={goal} />
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    height: 140,
  },
  card: {
    borderWidth: 1,
  },
  title: {
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: { justifyContent: 'center', minHeight: 44 },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 8,
  },
});
