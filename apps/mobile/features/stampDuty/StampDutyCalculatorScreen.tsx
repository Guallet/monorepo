import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput, useTheme } from '@guallet/luna-mobile';
import {
  calculateStampDuty,
  type BuyerType,
  type StampDutyResult,
} from '@guallet/calculators';
import { AppScreen } from '@/components/layout/AppScreen';
import { StampDutyBandRow, formatStampDutyMoney } from './StampDutyBandRow';
import { StampDutyCard } from './StampDutyCard';
import {
  formatStampDutyPriceText,
  parseStampDutyPrice,
} from './stampDutyInput';

const BUYER_OPTIONS: {
  value: BuyerType;
  label: string;
  hint: string;
}[] = [
  {
    value: 'standard',
    label: 'Standard',
    hint: 'Your only property, or you are replacing your main home',
  },
  {
    value: 'firstTimeBuyer',
    label: 'First-time buyer',
    hint: 'All buyers are first-time buyers and intend to live here as their main home',
  },
  {
    value: 'additionalProperty',
    label: 'Additional property',
    hint: 'You will own another home and are not replacing your main home',
  },
];

export default function StampDutyCalculatorScreen() {
  const router = useRouter();
  const { borderRadius, colors, spacing, typography } = useTheme();
  const [priceText, setPriceText] = useState('350,000');
  const [buyerType, setBuyerType] = useState<BuyerType>('standard');
  const selectedBuyerHint = BUYER_OPTIONS.find(
    (option) => option.value === buyerType,
  )?.hint;
  const parsed = parseStampDutyPrice(priceText);
  let result: StampDutyResult | null = null;
  if (parsed.price !== null) {
    result = calculateStampDuty({
      propertyPrice: parsed.price,
      buyerType,
    });
  }

  function openBands() {
    if (parsed.price === null) return;
    router.push({
      pathname: '/tools/stamp-duty/bands',
      params: { price: String(parsed.price), buyerType },
    });
  }

  return (
    <AppScreen headerTitle="Stamp duty calculator">
      <ScrollView
        contentContainerStyle={{ gap: spacing.md, padding: spacing.md }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: colors.surface.background.secondary,
            borderRadius: borderRadius.md,
            padding: spacing.sm,
          }}
        >
          <Text
            style={{
              color: colors.accent.primary,
              fontSize: typography.sizes.sm,
              fontWeight: '600',
            }}
          >
            England & Northern Ireland · SDLT
          </Text>
        </View>

        <StampDutyCard>
          <TextInput
            accessibilityLabel="Property price in pounds"
            accessibilityHint={
              parsed.error ?? 'Enter the agreed purchase price'
            }
            label="Property price (£)"
            description="Enter the agreed purchase price"
            error={parsed.error}
            keyboardType="number-pad"
            value={priceText}
            onChangeText={(text) =>
              setPriceText(formatStampDutyPriceText(text))
            }
            rightSection={
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.sizes.sm,
                }}
              >
                GBP
              </Text>
            }
          />

          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.md,
              fontWeight: '600',
              marginBottom: spacing.sm,
            }}
          >
            Buyer type
          </Text>
          <View style={[styles.options, { gap: spacing.xs }]}>
            {BUYER_OPTIONS.map((option) => {
              const selected = buyerType === option.value;
              let backgroundColor = colors.surface.background.primary;
              let borderColor = colors.surface.border.primary;
              let textColor = colors.text.primary;
              let fontWeight: '500' | '700' = '500';
              if (selected) {
                backgroundColor = colors.surface.background.secondary;
                borderColor = colors.accent.primary;
                textColor = colors.accent.primary;
                fontWeight = '700';
              }
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityHint={option.hint}
                  accessibilityState={{ checked: selected }}
                  onPress={() => setBuyerType(option.value)}
                  style={[
                    styles.option,
                    {
                      backgroundColor,
                      borderColor,
                      borderRadius: borderRadius.md,
                      minWidth: spacing.xxl * 2,
                      padding: spacing.sm,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: textColor,
                      fontSize: typography.sizes.sm,
                      fontWeight,
                      textAlign: 'center',
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.xs,
              marginTop: spacing.sm,
            }}
          >
            {selectedBuyerHint}
          </Text>
        </StampDutyCard>

        {!result && (
          <Text
            accessibilityRole="alert"
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
            }}
          >
            Enter a valid property price to see your estimate.
          </Text>
        )}

        {result && (
          <>
            {result.ftbReliefApplied && (
              <Text
                style={{
                  color: colors.support.dark,
                  fontSize: typography.sizes.sm,
                }}
              >
                First-time buyer relief applied: 0% on the first £300,000.
              </Text>
            )}
            {result.ftbReliefUnavailable && (
              <Text
                accessibilityRole="alert"
                style={{
                  color: colors.status.error,
                  fontSize: typography.sizes.sm,
                }}
              >
                First-time buyer relief is unavailable above £500,000. Standard
                rates apply.
              </Text>
            )}
            {buyerType === 'additionalProperty' &&
              parsed.price !== null &&
              parsed.price < 40_000 && (
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: typography.sizes.sm,
                  }}
                >
                  Additional-property higher rates usually start at £40,000.
                  Standard bands apply to this estimate.
                </Text>
              )}

            <View
              accessible
              accessibilityLabel={`Estimated stamp duty ${formatStampDutyMoney(result.totalDue)}. Effective rate ${result.effectiveRate} percent.`}
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
                Estimated stamp duty
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
                Effective rate {result.effectiveRate}%
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
                How it is calculated
              </Text>
              {result.bands
                .filter((band) => band.taxableAmount > 0)
                .map((band) => (
                  <StampDutyBandRow key={band.label} band={band} />
                ))}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View all tax bands"
                onPress={openBands}
                style={{ paddingVertical: spacing.md }}
              >
                <Text
                  style={{
                    color: colors.accent.primary,
                    fontSize: typography.sizes.sm,
                    fontWeight: '700',
                  }}
                >
                  View all tax bands →
                </Text>
              </Pressable>
            </StampDutyCard>
          </>
        )}

        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.xs,
          }}
        >
          England and Northern Ireland residential SDLT rates effective from 1
          April 2025. Other reliefs and surcharges may change the tax due.
        </Text>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: 'center',
  },
});
