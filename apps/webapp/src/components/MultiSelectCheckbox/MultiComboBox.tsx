import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IProps {
  data: string[];
  placeholder?: string;
  emptyMessage?: string;
  allItemsSelectedMessage?: string;
  onSelectionChanged?: (selectedItems: string[]) => void;
  className?: string;
}

export function MultiSelectCheckbox({
  data,
  placeholder,
  emptyMessage,
  allItemsSelectedMessage,
  onSelectionChanged,
  className,
}: Readonly<IProps>) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [value, setValue] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSelectedValue = (selectedValue: string) => {
    setValue((currentValue) => {
      const nextValue = currentValue.includes(selectedValue)
        ? currentValue.filter((existingValue) => existingValue !== selectedValue)
        : [...currentValue, selectedValue];

      onSelectionChanged?.(nextValue);

      return nextValue;
    });
  };

  const selectAll = () => {
    const allValues = [...data];

    setValue(allValues);
    onSelectionChanged?.(allValues);
  };

  const clearAll = () => {
    setValue([]);
    onSelectionChanged?.([]);
  };

  const selectedItemsLabel = useMemo(() => {
    if (value.length === 0) {
      return emptyMessage ?? placeholder ?? 'No items selected';
    }

    if (value.length === data.length) {
      return allItemsSelectedMessage ?? 'All items selected';
    }

    if (value.length === 1) {
      return value[0];
    }

    return `${value.length} items selected`;
  }, [allItemsSelectedMessage, data.length, emptyMessage, placeholder, value]);

  return (
    <div className={cn('relative min-w-[220px]', className)} ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between font-normal"
        onClick={() => {
          setIsOpen((currentOpen) => !currentOpen);
        }}
      >
        <span className={cn(value.length === 0 ? 'text-muted-foreground' : null)}>
          {selectedItemsLabel}
        </span>
      </Button>

      {isOpen ? (
        <div className="absolute z-50 mt-2 w-full rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
              Select all
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          </div>

          <div className="max-h-56 overflow-y-auto rounded-md border">
            {data.map((item) => {
              const isChecked = value.includes(item);

              return (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      toggleSelectedValue(item);
                    }}
                    className="h-4 w-4"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
