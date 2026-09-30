import { describe, expect, it } from 'vitest';
import { calculateStampDuty, normalizeStampDutyValues } from './stampDuty';

describe('stamp duty calculations shared by web and mobile', () => {
  it('matches the web standard-purchase result and band breakdown', () => {
    const result = calculateStampDuty({
      propertyPrice: 350_000,
      buyerType: 'standard',
    });

    expect(result.totalDue).toBe(7_500);
    expect(result.effectiveRate).toBe(2.14);
    expect(
      result.bands.map(({ taxableAmount, taxDue }) => ({
        taxableAmount,
        taxDue,
      })),
    ).toEqual([
      { taxableAmount: 125_000, taxDue: 0 },
      { taxableAmount: 125_000, taxDue: 2_500 },
      { taxableAmount: 100_000, taxDue: 5_000 },
      { taxableAmount: 0, taxDue: 0 },
      { taxableAmount: 0, taxDue: 0 },
    ]);
  });

  it('applies first-time buyer relief up to £500,000 only', () => {
    const eligible = calculateStampDuty({
      propertyPrice: 350_000,
      buyerType: 'firstTimeBuyer',
    });
    expect(eligible.totalDue).toBe(2_500);
    expect(eligible.ftbReliefApplied).toBe(true);
    expect(eligible.ftbReliefUnavailable).toBe(false);

    const cap = calculateStampDuty({
      propertyPrice: 500_000,
      buyerType: 'firstTimeBuyer',
    });
    expect(cap.totalDue).toBe(10_000);
    expect(cap.ftbReliefApplied).toBe(true);

    const overCap = calculateStampDuty({
      propertyPrice: 500_001,
      buyerType: 'firstTimeBuyer',
    });
    expect(overCap.totalDue).toBe(15_000.05);
    expect(overCap.ftbReliefUnavailable).toBe(true);
    expect(overCap.ftbReliefApplied).toBe(false);
  });

  it('applies the additional-property surcharge from £40,000', () => {
    expect(
      calculateStampDuty({
        propertyPrice: 350_000,
        buyerType: 'additionalProperty',
      }).totalDue,
    ).toBe(25_000);
    expect(
      calculateStampDuty({
        propertyPrice: 39_999,
        buyerType: 'additionalProperty',
      }).totalDue,
    ).toBe(0);
    expect(
      calculateStampDuty({
        propertyPrice: 40_000,
        buyerType: 'additionalProperty',
      }).totalDue,
    ).toBe(2_000);
  });

  it('handles zero and negative prices consistently with the web calculator', () => {
    expect(
      normalizeStampDutyValues({ propertyPrice: -1, buyerType: 'standard' }),
    ).toEqual({ propertyPrice: 0, buyerType: 'standard' });
    const result = calculateStampDuty({
      propertyPrice: 0,
      buyerType: 'standard',
    });
    expect(result.totalDue).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });
});
