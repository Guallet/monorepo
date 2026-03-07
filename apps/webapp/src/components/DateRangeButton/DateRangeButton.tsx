import { useMemo, useState } from 'react';
import { ResponsiveModal } from '@guallet/ui-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DateListPicker,
  DateRangeSelectionItem,
  findDateRangeSelectionItem,
} from './DateListPicker';
import { CalendarDateRangePicker } from './CalendarDateRangePicker';

interface Props {
  selectedRange: { startDate: Date; endDate: Date } | null;
  onRangeSelected: (range: { startDate: Date; endDate: Date } | null) => void;
}

interface DraftRange {
  startDate: Date | null;
  endDate: Date | null;
}

function toCompleteRange(range: DraftRange | null): {
  startDate: Date;
  endDate: Date;
} | null {
  if (!range?.startDate || !range?.endDate) {
    return null;
  }

  return {
    startDate: range.startDate,
    endDate: range.endDate,
  };
}

export function DateRangeButton({
  selectedRange,
  onRangeSelected,
}: Readonly<Props>) {
  const [isOpened, setIsOpened] = useState(false);
  const [range, setRange] = useState<DraftRange | null>(selectedRange ?? null);
  const [listItemSelected, setListItemSelected] =
    useState<DateRangeSelectionItem | null>(
      findDateRangeSelectionItem(selectedRange),
    );

  const buttonLabel = useMemo(() => {
    if (!selectedRange) {
      return 'Select range';
    }

    const matchingSelection = findDateRangeSelectionItem(selectedRange);

    return matchingSelection?.label ?? 'Custom range';
  }, [selectedRange]);

  const openModal = () => {
    const matchingSelection = findDateRangeSelectionItem(selectedRange);

    setListItemSelected(matchingSelection);
    setRange(selectedRange ?? null);
    setIsOpened(true);
  };

  const closeModal = () => {
    setIsOpened(false);
  };

  const applySelection = () => {
    onRangeSelected(toCompleteRange(range));
    closeModal();
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start"
        onClick={openModal}
      >
        {buttonLabel}
      </Button>

      <ResponsiveModal
        opened={isOpened}
        onClose={closeModal}
        title="Select date range"
        size="xl"
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="max-h-[320px] overflow-y-auto rounded-md border p-1">
              <DateListPicker
                value={listItemSelected}
                onItemSelected={(selectedItem) => {
                  setListItemSelected(selectedItem);
                  setRange({
                    startDate: selectedItem.range.startDate,
                    endDate: selectedItem.range.endDate,
                  });
                }}
              />
            </div>

            <CalendarDateRangePicker
              startDate={range?.startDate ?? null}
              endDate={range?.endDate ?? null}
              onRangeChanged={(nextRange) => {
                setListItemSelected(null);
                setRange(nextRange);
              }}
            />
          </div>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="button" onClick={applySelection}>
              Apply
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </>
  );
}
