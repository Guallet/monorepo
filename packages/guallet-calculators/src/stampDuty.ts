import { Money } from '@guallet/money';

export type BuyerType = 'standard' | 'firstTimeBuyer' | 'additionalProperty';

export interface StampDutyValues {
  propertyPrice: number;
  buyerType: BuyerType;
}

export interface StampDutyBandResult {
  label: string;
  rate: number;
  taxableAmount: number;
  taxDue: number;
}

export interface StampDutyResult {
  bands: StampDutyBandResult[];
  totalDue: number;
  effectiveRate: number;
  ftbReliefApplied: boolean;
  ftbReliefUnavailable: boolean;
}

function roundCurrency(value: number): number {
  return Money.fromCurrencyCode({ amount: value, currencyCode: 'GBP' }).round()
    .amount;
}

interface Band {
  min: number;
  max: number | null;
  rate: number;
}

function formatBandLabel(min: number, max: number | null): string {
  const fmt = (n: number) =>
    Money.fromCurrencyCode({ amount: n, currencyCode: 'GBP' }).format({
      locale: 'en-GB',
    });
  return max === null ? `Over ${fmt(min)}` : `${fmt(min)} – ${fmt(max)}`;
}

// England & Northern Ireland — April 2025 rates
const STANDARD_BANDS: Band[] = [
  { min: 0, max: 125_000, rate: 0 },
  { min: 125_000, max: 250_000, rate: 2 },
  { min: 250_000, max: 925_000, rate: 5 },
  { min: 925_000, max: 1_500_000, rate: 10 },
  { min: 1_500_000, max: null, rate: 12 },
];

const FTB_BANDS: Band[] = [
  { min: 0, max: 300_000, rate: 0 },
  { min: 300_000, max: 500_000, rate: 5 },
];

// Standard rates + 5% surcharge on each band
const ADDITIONAL_PROPERTY_BANDS: Band[] = [
  { min: 0, max: 125_000, rate: 5 },
  { min: 125_000, max: 250_000, rate: 7 },
  { min: 250_000, max: 925_000, rate: 10 },
  { min: 925_000, max: 1_500_000, rate: 15 },
  { min: 1_500_000, max: null, rate: 17 },
];

const FTB_RELIEF_CAP = 500_000;
const ADDITIONAL_PROPERTY_MIN_PRICE = 40_000;

function applyBands(price: number, bands: Band[]): StampDutyBandResult[] {
  return bands.map((band) => {
    const bandMax = band.max ?? Infinity;
    const taxableAmount = Math.max(0, Math.min(price, bandMax) - band.min);
    // Full bands produce whole-pound tax; round the final occupied band down.
    const taxDue = Math.floor((taxableAmount * band.rate) / 100);
    return {
      label: formatBandLabel(band.min, band.max),
      rate: band.rate,
      taxableAmount,
      taxDue,
    };
  });
}

export function normalizeStampDutyValues(
  values: StampDutyValues,
): StampDutyValues {
  return {
    propertyPrice: Math.max(0, values.propertyPrice),
    buyerType: values.buyerType,
  };
}

export function calculateStampDuty(values: StampDutyValues): StampDutyResult {
  const { propertyPrice, buyerType } = normalizeStampDutyValues(values);

  const ftbReliefUnavailable =
    buyerType === 'firstTimeBuyer' && propertyPrice > FTB_RELIEF_CAP;
  const ftbReliefApplied =
    buyerType === 'firstTimeBuyer' && propertyPrice <= FTB_RELIEF_CAP;

  let bands: Band[];
  if (
    buyerType === 'additionalProperty' &&
    propertyPrice >= ADDITIONAL_PROPERTY_MIN_PRICE
  ) {
    bands = ADDITIONAL_PROPERTY_BANDS;
  } else if (ftbReliefApplied) {
    bands = FTB_BANDS;
  } else {
    bands = STANDARD_BANDS;
  }

  const bandResults = applyBands(propertyPrice, bands);
  const totalDue = bandResults.reduce((sum, band) => sum + band.taxDue, 0);
  const effectiveRate =
    propertyPrice > 0 ? roundCurrency((totalDue / propertyPrice) * 100) : 0;

  return {
    bands: bandResults,
    totalDue,
    effectiveRate,
    ftbReliefApplied,
    ftbReliefUnavailable,
  };
}
