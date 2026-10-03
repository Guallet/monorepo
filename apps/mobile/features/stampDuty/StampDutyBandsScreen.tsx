import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@guallet/luna-mobile';
import { calculateStampDuty, type BuyerType } from '@guallet/calculators';
import { AppScreen } from '@/components/layout/AppScreen';
import { StampDutyBandRow, formatStampDutyMoney } from './StampDutyBandRow';
import { StampDutyCard } from './StampDutyCard';
import { parseStampDutyPrice } from './stampDutyInput';

function isBuyerType(value: unknown): value is BuyerType {
  return (
    value === 'standard' ||
    value === 'firstTimeBuyer' ||
    value === 'additionalProperty'
  );
}

function buyerTypeLabel(value: BuyerType): string {
  if (value === 'firstTimeBuyer') return 'first-time buyer';
  if (value === 'additionalProperty') return 'additional property';
  return 'standard buyer';
}

export default function StampDutyBandsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    price?: string;
    buyerType?: string;
  }>();
  const { borderRadius, colors, spacing, typography } = useTheme();
  const parsed = parseStampDutyPrice(params.price ?? '');

  if (parsed.price === null || !isBuyerType(params.buyerType)) {
    return (
      <AppScreen headerTitle="Tax band breakdown">
        <View style={{ padding: spacing.md }}>
          <Text
            accessibilityRole="alert"
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.md,
            }}
          >
            This estimate is unavailable. Enter a property price again.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to stamp duty calculator"
            onPress={() => router.back()}
            style={{ paddingVertical: spacing.md }}
          >
            <Text
              style={{
                color: colors.accent.primary,
                fontSize: typography.sizes.sm,
                fontWeight: '700',
              }}
            >
              Back to calculator
            </Text>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  const result = calculateStampDuty({
    propertyPrice: parsed.price,
    buyerType: params.buyerType,
  });

  return (
    <AppScreen headerTitle="Tax band breakdown">
      <ScrollView
        contentContainerStyle={{ gap: spacing.md, padding: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <View
          accessible
          accessibilityLabel={`Total stamp duty ${formatStampDutyMoney(result.totalDue)} for a ${formatStampDutyMoney(parsed.price)} ${buyerTypeLabel(params.buyerType)} purchase`}
          style={{
            backgroundColor: colors.surface.background.secondary,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
          }}
        >
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
            }}
          >
            Total stamp duty
          </Text>
          <Text
            style={{
              color: colors.accent.primary,
              fontSize: typography.sizes.xxl,
              fontVariant: ['tabular-nums'],
              fontWeight: '700',
              marginVertical: spacing.xs,
            }}
          >
            {formatStampDutyMoney(result.totalDue)}
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
            }}
          >
            {formatStampDutyMoney(parsed.price)} ·{' '}
            {buyerTypeLabel(params.buyerType)}
          </Text>
        </View>

        <StampDutyCard>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.md,
              fontWeight: '700',
              marginBottom: spacing.xs,
            }}
          >
            Applicable bands
          </Text>
          {result.bands.map((band) => (
            <StampDutyBandRow key={band.label} band={band} />
          ))}
          <View
            style={[
              styles.totalRow,
              { gap: spacing.sm, paddingTop: spacing.md },
            ]}
          >
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.md,
                fontWeight: '700',
              }}
            >
              Total
            </Text>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.md,
                fontVariant: ['tabular-nums'],
                fontWeight: '700',
              }}
            >
              {formatStampDutyMoney(result.totalDue)}
            </Text>
          </View>
        </StampDutyCard>

        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.sm,
          }}
        >
          Each rate applies only to the portion of the price within that band.
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.xs,
          }}
        >
          England and Northern Ireland residential SDLT rates effective from 1
          April 2025. Other reliefs and surcharges may change the amount due.
        </Text>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
