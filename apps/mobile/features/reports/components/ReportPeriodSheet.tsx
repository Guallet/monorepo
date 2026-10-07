import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BottomSheet, useTheme } from '@guallet/luna-mobile';
import { ReportButton as Button, ReportText } from './ReportUi';
import type { ReportPeriod } from '../reportModels';

export function ReportPeriodSheet({
  period,
  locale,
  onClose,
  onSelect,
}: Readonly<{
  period: ReportPeriod;
  locale: string;
  onClose: () => void;
  onSelect: (period: ReportPeriod) => void;
}>) {
  const [year, setYear] = useState(period.year);
  const { spacing } = useTheme();
  const today = new Date();
  return (
    <BottomSheet
      isOpen
      title="Choose month"
      showCloseIcon
      onClose={onClose}
      snapPoints={['full']}
    >
      <ScrollView
        contentContainerStyle={{ gap: spacing.md, padding: spacing.md }}
      >
        <View style={[styles.year, { gap: spacing.sm }]}>
          <Button
            variant="outline"
            accessibilityLabel="Previous year"
            disabled={year <= 1900}
            onClick={() => setYear(year - 1)}
          >
            Previous
          </Button>
          <ReportText heading>{year}</ReportText>
          <Button
            variant="outline"
            accessibilityLabel="Next year"
            disabled={year >= today.getUTCFullYear()}
            onClick={() => setYear(year + 1)}
          >
            Next
          </Button>
        </View>
        {Array.from({ length: 12 }, (_, index) => {
          const month = index + 1;
          const label = new Intl.DateTimeFormat(locale, {
            month: 'long',
            timeZone: 'UTC',
          }).format(new Date(Date.UTC(year, index, 1)));
          let disabled = false;
          if (year === today.getUTCFullYear() && index > today.getUTCMonth())
            disabled = true;
          return (
            <Button
              key={month}
              variant="outline"
              selected={year === period.year && month === period.month}
              disabled={disabled}
              onClick={() => onSelect({ year, month })}
            >
              {label}
            </Button>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  year: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
});
