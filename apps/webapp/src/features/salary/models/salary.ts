export type IncomeFrequency = 'annual' | 'monthly' | 'weekly';
export type PensionType = 'none' | 'salaryScrifice' | 'reliefAtSource';
export type PensionMode = 'percentage' | 'fixed';
export type StudentLoanPlan =
  | 'none'
  | 'plan1'
  | 'plan2'
  | 'plan4'
  | 'plan5'
  | 'postgrad';

export interface SalaryValues {
  grossIncome: number;
  incomeFrequency: IncomeFrequency;
  isScotland: boolean;
  pensionType: PensionType;
  pensionMode: PensionMode;
  pensionValue: number;
  studentLoanPlan: StudentLoanPlan;
}

export interface TaxBandResult {
  label: string;
  rate: number;
  taxableAmount: number;
  taxDue: number;
}

export interface SalaryResult {
  grossAnnual: number;
  personalAllowance: number;
  pensionDeduction: number;
  taxableIncome: number;
  incomeTaxBands: TaxBandResult[];
  totalIncomeTax: number;
  niBands: TaxBandResult[];
  totalNI: number;
  studentLoanDeduction: number;
  totalDeductions: number;
  takeHomeAnnual: number;
  takeHomeMonthly: number;
  takeHomeWeekly: number;
  pensionTaxRelief: number;
}

// 2025/26 constants
const PERSONAL_ALLOWANCE = 12_570;
const PA_TAPER_THRESHOLD = 100_000;
const PA_ZERO_AT = 125_140;
const NI_PRIMARY_THRESHOLD = 12_570;
const NI_UPPER_EARNINGS_LIMIT = 50_270;

interface RateBand {
  min: number;
  max: number | null;
  rate: number;
  label: string;
}

const ENGLAND_TAX_BANDS: RateBand[] = [
  { min: 0, max: 37_700, rate: 20, label: 'Basic rate (20%)' },
  { min: 37_700, max: 112_570, rate: 40, label: 'Higher rate (40%)' },
  { min: 112_570, max: null, rate: 45, label: 'Additional rate (45%)' },
];

const SCOTLAND_TAX_BANDS: RateBand[] = [
  { min: 0, max: 2_306, rate: 19, label: 'Starter rate (19%)' },
  { min: 2_306, max: 13_991, rate: 20, label: 'Basic rate (20%)' },
  { min: 13_991, max: 31_092, rate: 21, label: 'Intermediate rate (21%)' },
  { min: 31_092, max: 62_430, rate: 42, label: 'Higher rate (42%)' },
  { min: 62_430, max: 112_570, rate: 45, label: 'Advanced rate (45%)' },
  { min: 112_570, max: null, rate: 48, label: 'Top rate (48%)' },
];

const NI_BANDS: RateBand[] = [
  {
    min: NI_PRIMARY_THRESHOLD,
    max: NI_UPPER_EARNINGS_LIMIT,
    rate: 8,
    label: 'Standard rate (8%)',
  },
  {
    min: NI_UPPER_EARNINGS_LIMIT,
    max: null,
    rate: 2,
    label: 'Upper earnings (2%)',
  },
];

interface StudentLoanConfig {
  threshold: number;
  rate: number;
}

const STUDENT_LOAN_PLANS: Record<
  Exclude<StudentLoanPlan, 'none'>,
  StudentLoanConfig
> = {
  plan1: { threshold: 24_990, rate: 0.09 },
  plan2: { threshold: 27_295, rate: 0.09 },
  plan4: { threshold: 31_395, rate: 0.09 },
  plan5: { threshold: 25_000, rate: 0.09 },
  postgrad: { threshold: 21_000, rate: 0.06 },
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function normalizeToAnnual(
  income: number,
  frequency: IncomeFrequency,
): number {
  if (frequency === 'monthly') return income * 12;
  if (frequency === 'weekly') return income * 52;
  return income;
}

function computePersonalAllowance(grossAnnual: number): number {
  if (grossAnnual <= PA_TAPER_THRESHOLD) return PERSONAL_ALLOWANCE;
  if (grossAnnual >= PA_ZERO_AT) return 0;
  const reduction = Math.floor((grossAnnual - PA_TAPER_THRESHOLD) / 2);
  return Math.max(0, PERSONAL_ALLOWANCE - reduction);
}

function computePensionDeduction(
  values: SalaryValues,
  grossAnnual: number,
): number {
  if (values.pensionType === 'none' || values.pensionValue <= 0) return 0;
  if (values.pensionMode === 'percentage') {
    return round2(grossAnnual * (values.pensionValue / 100));
  }
  // fixed is already annual (user enters monthly value? No — per plan it's annual)
  return Math.min(values.pensionValue, grossAnnual);
}

function applyTaxBands(
  taxableIncome: number,
  bands: RateBand[],
): TaxBandResult[] {
  return bands
    .map((band) => {
      const bandMax = band.max ?? Infinity;
      const taxableAmount = Math.max(
        0,
        Math.min(taxableIncome, bandMax) - band.min,
      );
      const taxDue = round2((taxableAmount * band.rate) / 100);
      return { label: band.label, rate: band.rate, taxableAmount, taxDue };
    })
    .filter((b) => b.taxableAmount > 0);
}

function applyNIBands(grossAnnual: number): TaxBandResult[] {
  return NI_BANDS.map((band) => {
    const bandMax = band.max ?? Infinity;
    const taxableAmount = Math.max(
      0,
      Math.min(grossAnnual, bandMax) - band.min,
    );
    const taxDue = round2((taxableAmount * band.rate) / 100);
    return { label: band.label, rate: band.rate, taxableAmount, taxDue };
  }).filter((b) => b.taxableAmount > 0);
}

export function calculateSalary(values: SalaryValues): SalaryResult {
  const grossAnnual = Math.max(
    0,
    normalizeToAnnual(values.grossIncome, values.incomeFrequency),
  );

  const pensionDeduction = computePensionDeduction(values, grossAnnual);

  // Salary sacrifice: pension reduces the gross before tax & NI
  const isSacrifice = values.pensionType === 'salaryScrifice';
  const grossForTax = isSacrifice
    ? Math.max(0, grossAnnual - pensionDeduction)
    : grossAnnual;
  const grossForNI = isSacrifice
    ? Math.max(0, grossAnnual - pensionDeduction)
    : grossAnnual;

  const personalAllowance = computePersonalAllowance(grossForTax);
  const taxableIncome = Math.max(0, grossForTax - personalAllowance);

  const taxBands = values.isScotland ? SCOTLAND_TAX_BANDS : ENGLAND_TAX_BANDS;
  const incomeTaxBands = applyTaxBands(taxableIncome, taxBands);
  const totalIncomeTax = round2(
    incomeTaxBands.reduce((sum, b) => sum + b.taxDue, 0),
  );

  const niBands = applyNIBands(grossForNI);
  const totalNI = round2(niBands.reduce((sum, b) => sum + b.taxDue, 0));

  let studentLoanDeduction = 0;
  if (values.studentLoanPlan !== 'none') {
    const plan = STUDENT_LOAN_PLANS[values.studentLoanPlan];
    studentLoanDeduction = round2(
      Math.max(0, grossAnnual - plan.threshold) * plan.rate,
    );
  }

  // Relief at source: basic rate top-up HMRC adds automatically
  const pensionTaxRelief =
    values.pensionType === 'reliefAtSource'
      ? round2(pensionDeduction * 0.2)
      : 0;

  const totalDeductions = round2(
    totalIncomeTax + totalNI + studentLoanDeduction + pensionDeduction,
  );

  const takeHomeAnnual = round2(grossAnnual - totalDeductions);
  const takeHomeMonthly = round2(takeHomeAnnual / 12);
  const takeHomeWeekly = round2(takeHomeAnnual / 52);

  return {
    grossAnnual,
    personalAllowance,
    pensionDeduction,
    taxableIncome,
    incomeTaxBands,
    totalIncomeTax,
    niBands,
    totalNI,
    studentLoanDeduction,
    totalDeductions,
    takeHomeAnnual,
    takeHomeMonthly,
    takeHomeWeekly,
    pensionTaxRelief,
  };
}
