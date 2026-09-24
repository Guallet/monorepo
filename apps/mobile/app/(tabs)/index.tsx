import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useUser } from '@guallet/api-react';
import { useTheme } from '@guallet/luna-mobile';
import { WealthCard } from '@/features/dashboard/components/WealthCard';
import { CashflowSummaryRow } from '@/features/dashboard/components/CashflowSummaryRow';
import { RecentTransactionsWidget } from '@/features/dashboard/components/RecentTransactionsWidget';
import { SavingGoalsWidget } from '@/features/dashboard/components/SavingGoalsWidget';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { formatPreferenceDate } from '@/utils/formatPreferenceDate';

function formatGreetingDate(
  date: Date,
  languageTag: string,
  dateFormat: ReturnType<typeof useMobileUserPreferences>['dateFormat'],
): string {
  const weekday = new Intl.DateTimeFormat(languageTag, {
    weekday: 'long',
  }).format(date);
  return `${weekday}, ${formatPreferenceDate(date, dateFormat)}`;
}

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0] ?? fullName;
}

export default function DashboardScreen() {
  const { colors, spacing, typography } = useTheme();
  const { user } = useUser();
  const { languageTag, dateFormat } = useMobileUserPreferences();
  const router = useRouter();
  const [monthDelta, setMonthDelta] = useState<number | undefined>(undefined);

  const handleMonthDeltaChange = useCallback((delta: number) => {
    setMonthDelta(delta);
  }, []);

  const handleSeeAllTransactions = useCallback(() => {
    router.navigate('/(tabs)/transactions');
  }, [router]);

  const today = new Date();
  const firstName = user ? getFirstName(user.name) : '';

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: colors.surface.background.page },
      ]}
      edges={['top']}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { padding: spacing.md, gap: spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text
            style={[
              styles.greetingTitle,
              { color: colors.text.primary, fontSize: typography.sizes.xxl },
            ]}
          >
            Hi, {firstName}
          </Text>
          <Text
            style={[
              styles.greetingDate,
              { color: colors.text.secondary, fontSize: typography.sizes.sm },
            ]}
          >
            {formatGreetingDate(today, languageTag, dateFormat)}
          </Text>
        </View>

        {/* Total Wealth */}
        <WealthCard monthDelta={monthDelta} />

        {/* Income / Expense 30-day summary */}
        <CashflowSummaryRow onMonthDeltaChange={handleMonthDeltaChange} />

        {/* Recent Transactions */}
        <RecentTransactionsWidget onSeeAll={handleSeeAllTransactions} />

        {/* Saving Goals */}
        <SavingGoalsWidget />

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  greeting: {
    gap: 2,
  },
  greetingTitle: {
    fontWeight: '700',
  },
  greetingDate: {
    fontWeight: '400',
  },
  bottomPad: {
    height: 16,
  },
});
