import { alpha, Stack, UnstyledButton } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@guallet/ui-react';

export interface IProps {
  value: DateRangeSelectionItem | null;
  onItemSelected: (selected: DateRangeSelectionItem) => void;
}

export type RangeValue =
  | 'today'
  | 'yesterday'
  | 'last-7-days'
  | 'last-30-days'
  | 'last-365-days'
  | 'last-month'
  | 'last-12-months'
  | 'last-year'
  | 'week-to-date'
  | 'month-to-date'
  | 'quarter-to-date'
  | 'year-to-date'
  | 'custom';

export type DateRangeSelectionItem = {
  value: RangeValue;
  label: string;
  range: { startDate: Date; endDate: Date } | null;
};

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}
function endOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

function buildOptions(): DateRangeSelectionItem[] {
  const today = startOfDay(new Date());

  return [
    {
      value: 'today',
      label: 'Today',
      range: { startDate: startOfDay(today), endDate: endOfDay(today) },
    },
    {
      value: 'yesterday',
      label: 'Yesterday',
      range: (() => {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        return { startDate: startOfDay(y), endDate: endOfDay(y) };
      })(),
    },
    {
      value: 'last-7-days',
      label: 'Last 7 days',
      range: (() => {
        const s = new Date(today);
        s.setDate(s.getDate() - 6);
        return { startDate: startOfDay(s), endDate: endOfDay(today) };
      })(),
    },
    {
      value: 'last-30-days',
      label: 'Last 30 days',
      range: (() => {
        const s = new Date(today);
        s.setDate(s.getDate() - 29);
        return { startDate: startOfDay(s), endDate: endOfDay(today) };
      })(),
    },
    {
      value: 'last-365-days',
      label: 'Last 365 days',
      range: (() => {
        const s = new Date(today);
        s.setDate(s.getDate() - 364);
        return { startDate: startOfDay(s), endDate: endOfDay(today) };
      })(),
    },
    {
      value: 'last-month',
      label: 'Last month',
      range: (() => {
        const s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const e = new Date(
          today.getFullYear(),
          today.getMonth(),
          0,
          23,
          59,
          59,
          999,
        );
        return { startDate: s, endDate: e };
      })(),
    },
    {
      value: 'last-12-months',
      label: 'Last 12 months',
      range: (() => {
        const s = new Date(today.getFullYear(), today.getMonth() - 11, 1);
        return { startDate: s, endDate: endOfDay(today) };
      })(),
    },
    {
      value: 'last-year',
      label: 'Last year',
      range: (() => {
        const y = today.getFullYear() - 1;
        return {
          startDate: new Date(y, 0, 1),
          endDate: new Date(y, 11, 31, 23, 59, 59, 999),
        };
      })(),
    },
    {
      value: 'week-to-date',
      label: 'Week to date',
      range: (() => {
        const dow = today.getDay();
        const diff = dow === 0 ? -6 : 1 - dow;
        const monday = new Date(today);
        monday.setDate(today.getDate() + diff);
        return { startDate: startOfDay(monday), endDate: endOfDay(today) };
      })(),
    },
    {
      value: 'month-to-date',
      label: 'Month to date',
      range: {
        startDate: new Date(today.getFullYear(), today.getMonth(), 1),
        endDate: endOfDay(today),
      },
    },
    {
      value: 'quarter-to-date',
      label: 'Quarter to date',
      range: (() => {
        const quarterStart = Math.floor(today.getMonth() / 3) * 3;
        return {
          startDate: new Date(today.getFullYear(), quarterStart, 1),
          endDate: endOfDay(today),
        };
      })(),
    },
    {
      value: 'year-to-date',
      label: 'Year to date',
      range: {
        startDate: new Date(today.getFullYear(), 0, 1),
        endDate: endOfDay(today),
      },
    },
    {
      value: 'custom',
      label: 'Custom range',
      range: null,
    },
  ];
}

export const DATE_RANGE_OPTIONS = buildOptions();

export function DateListPicker({ value, onItemSelected }: Readonly<IProps>) {
  const { t } = useTranslation();
  const { colors, borderRadius, spacing, typography } = useTheme();

  return (
    <Stack gap={2}>
      {DATE_RANGE_OPTIONS.map((option) => {
        const isActive = value?.value === option.value;
        return (
          <UnstyledButton
            key={option.value}
            onClick={() => onItemSelected(option)}
            style={{
              display: 'block',
              width: '100%',
              padding: `${spacing.sm}px ${spacing.md}px`,
              borderRadius: borderRadius.sm,
              background: isActive ? alpha(colors.primary, 0.1) : 'transparent',
              color: isActive ? colors.primary : colors.black,
              fontWeight: isActive
                ? typography.weights.semibold
                : typography.weights.medium,
              fontSize: typography.sizes.sm,
              lineHeight: typography.lineHeights.tight,
              transition: 'background 80ms, color 80ms',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  colors.pageBackground;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'transparent';
              }
            }}
          >
            {t(
              `components.dateRangePicker.presets.${option.value}`,
              option.label,
            )}
          </UnstyledButton>
        );
      })}
    </Stack>
  );
}
