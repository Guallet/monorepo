import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSavingGoals } from '@guallet/api-react';
import { useTheme } from '@guallet/luna-mobile';
import { SavingGoalProgressItem } from './SavingGoalProgressItem';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';

const MAX_GOALS = 3;

export function SavingGoalsWidget() {
  const router = useRouter();
  const { colors, borderRadius, spacing, typography } = useTheme();
  const { savingGoals, isLoading, isError } = useSavingGoals();
  const { defaultCurrency } = useMobileUserPreferences();

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
          Saving goals
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See all saving goals"
          onPress={() => router.push('/saving-goals')}
          style={styles.link}
        >
          <Text style={{ color: colors.accent.primary, fontWeight: '600' }}>
            See all
          </Text>
        </Pressable>
      </View>

      {isError && (
        <Text style={{ color: colors.text.secondary }}>
          Couldn’t load goals. Open saving goals to try again.
        </Text>
      )}
      {!isError && goals.length === 0 ? (
        <Text
          style={[
            styles.emptyText,
            { color: colors.text.secondary, fontSize: typography.sizes.sm },
          ]}
        >
          No saving goals yet. Create your first goal to track progress.
        </Text>
      ) : (
        !isError &&
        goals.map((goal) => (
          <Pressable
            key={goal.id}
            accessibilityRole="button"
            accessibilityLabel={`View ${goal.name} goal`}
            onPress={() => router.push(`/saving-goals/${goal.id}`)}
          >
            <SavingGoalProgressItem
              goal={goal}
              currency={goal.currency ?? defaultCurrency}
            />
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
