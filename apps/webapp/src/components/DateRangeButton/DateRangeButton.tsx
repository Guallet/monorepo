import {
  alpha,
  Box,
  Button,
  Divider,
  Group,
  Popover,
  ScrollArea,
  Text,
} from '@mantine/core';
import { IconCalendar, IconChevronDown } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@guallet/ui-react';
import { DateListPicker, DateRangeSelectionItem } from './DateListPicker';
import { CalendarDateRangePicker } from './CalendarDateRangePicker';

interface Props {
  selectedRange: { startDate: Date; endDate: Date } | null;
  onRangeSelected: (range: { startDate: Date; endDate: Date } | null) => void;
}

function formatDateRange(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  return `${fmt(start)} → ${fmt(end)}`;
}

export function DateRangeButton({
  selectedRange,
  onRangeSelected,
}: Readonly<Props>) {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius } = useTheme();

  const [draft, setDraft] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  } | null>(selectedRange ?? null);
  const [opened, setOpened] = useState(false);
  const [activePreset, setActivePreset] =
    useState<DateRangeSelectionItem | null>(null);
  const [committedPreset, setCommittedPreset] =
    useState<DateRangeSelectionItem | null>(null);

  function openPopup() {
    setDraft(selectedRange ?? null);
    setActivePreset(committedPreset);
    setOpened(true);
  }

  function handlePresetSelected(preset: DateRangeSelectionItem) {
    setActivePreset(preset);
    if (preset.value === 'custom' || !preset.range) {
      return;
    }
    setDraft({
      startDate: preset.range.startDate,
      endDate: preset.range.endDate,
    });
  }

  function handleRangeChanged(
    range: { startDate: Date | null; endDate: Date | null } | null,
  ) {
    setActivePreset(null);
    setDraft(range ?? null);
  }

  function handleApply() {
    if (!draft?.startDate || !draft?.endDate) return;
    setCommittedPreset(activePreset?.value === 'custom' ? null : activePreset);
    onRangeSelected({ startDate: draft.startDate, endDate: draft.endDate });
    setOpened(false);
  }

  function handleCancel() {
    setOpened(false);
  }

  function getTriggerLabel(): string {
    if (!selectedRange) {
      return t('components.dateRangePicker.selectRange', 'Select range');
    }
    if (committedPreset) return committedPreset.label;
    return formatDateRange(selectedRange.startDate, selectedRange.endDate);
  }

  const canApply = !!(draft?.startDate && draft?.endDate);

  return (
    <Popover
      position="bottom-start"
      shadow="md"
      opened={opened}
      onChange={setOpened}
      radius="md"
      withinPortal
    >
      <Popover.Target>
        <Button
          variant="outline"
          leftSection={
            <IconCalendar size={15} style={{ color: colors.midGrey }} />
          }
          rightSection={
            <IconChevronDown
              size={12}
              style={{
                color: colors.midGrey,
                transform: opened ? 'rotate(180deg)' : 'none',
                transition: 'transform 200ms',
              }}
            />
          }
          styles={{
            root: {
              borderColor: opened ? colors.primary : undefined,
              boxShadow: opened
                ? `0 0 0 2px ${alpha(colors.primary, 0.18)}`
                : undefined,
              fontWeight: 500,
              paddingLeft: spacing.sm,
              paddingRight: spacing.sm,
            },
            label: { gap: spacing.xs },
          }}
          onClick={() => (opened ? setOpened(false) : openPopup())}
        >
          <Text fz="sm" fw={600} c={colors.black}>
            {getTriggerLabel()}
          </Text>
        </Button>
      </Popover.Target>

      <Popover.Dropdown
        p={0}
        style={{
          minWidth: 580,
          borderRadius: borderRadius.lg,
          overflow: 'hidden',
          border: `1px solid ${colors.paleGrey}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.10)',
        }}
      >
        <Group align="flex-start" gap={0} wrap="nowrap">
          {/* Presets sidebar */}
          <ScrollArea
            h={320}
            style={{
              width: 160,
              flexShrink: 0,
              borderRight: `1px solid ${colors.surface}`,
            }}
          >
            <Box p={spacing.xs}>
              <DateListPicker
                value={activePreset}
                onItemSelected={handlePresetSelected}
              />
            </Box>
          </ScrollArea>

          {/* Calendar panel */}
          <Box
            style={{
              flex: 1,
              padding: `${spacing.md}px ${spacing.md}px ${spacing.sm}px`,
            }}
          >
            <CalendarDateRangePicker
              startDate={draft?.startDate ?? null}
              endDate={draft?.endDate ?? null}
              onRangeChanged={handleRangeChanged}
            />
          </Box>
        </Group>

        <Divider color={colors.surface} />

        {/* Footer */}
        <Group
          justify="flex-end"
          gap={spacing.sm}
          p={`${spacing.sm}px ${spacing.md}px`}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            styles={{
              root: { borderColor: colors.primary, color: colors.primary },
            }}
          >
            {t('components.dateRangePicker.cancel', 'Cancel')}
          </Button>
          <Button size="sm" disabled={!canApply} onClick={handleApply}>
            {t('components.dateRangePicker.apply', 'Apply')}
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
}
