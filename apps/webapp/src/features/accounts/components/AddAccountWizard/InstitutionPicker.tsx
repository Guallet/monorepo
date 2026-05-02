import { useTheme } from '@guallet/ui-react';
import { Avatar, Box, Card, ScrollArea, Text, TextInput, UnstyledButton } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconCheck, IconChevronDown, IconSearch } from '@tabler/icons-react';
import { useInstitutions } from '@guallet/api-react';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface InstitutionPickerProps {
  value: string | null;
  onChange: (id: string | null) => void;
}

export function InstitutionPicker({ value, onChange }: Readonly<InstitutionPickerProps>) {
  const { t } = useTranslation();
  const { institutions } = useInstitutions();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 150);
  const ref = useRef<HTMLDivElement>(null);
  const { colors, borderRadius, spacing } = useTheme();

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return institutions.filter((i) => i.name.toLowerCase().includes(q)).slice(0, 10);
  }, [institutions, debouncedSearch]);

  const selected = value ? institutions.find((i) => i.id === value) : null;

  return (
    <Box ref={ref} style={{ position: 'relative' }}>
      <UnstyledButton
        style={{
          width: '100%',
          padding: `${spacing.sm}px ${spacing.md}px`,
          border: `1.5px solid ${open ? colors.primary : colors.midGrey}`,
          borderRadius: borderRadius.sm,
          background: colors.white,
          boxShadow: open
            ? `0 0 0 3px color-mix(in oklab, ${colors.primary} 14%, ${colors.white})`
            : undefined,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
          transition: 'border-color 150ms',
        }}
        onClick={() => setOpen((o) => !o)}
      >
        {selected ? (
          <>
            <Avatar src={selected.image_src} size={22} radius="xs" />
            <Text size="sm" style={{ flex: 1 }}>
              {selected.name}
            </Text>
          </>
        ) : (
          <Text size="sm" c="dimmed" style={{ flex: 1 }}>
            {t('feature.accounts.add.institutionPicker.placeholder', 'Search for a bank…')}
          </Text>
        )}
        <IconChevronDown
          size={14}
          color={colors.midGrey}
          style={{
            transform: open ? 'rotate(180deg)' : undefined,
            transition: 'transform 200ms',
          }}
        />
      </UnstyledButton>

      {open && (
        <Card
          shadow="md"
          radius="md"
          p={0}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 200,
            border: `1.5px solid ${colors.paleGrey}`,
            overflow: 'hidden',
          }}
        >
          <Box p="xs" style={{ borderBottom: `1px solid ${colors.paleGrey}` }}>
            <TextInput
              autoFocus
              placeholder={t(
                'feature.accounts.add.institutionPicker.searchPlaceholder',
                'Type to search…',
              )}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="xs"
              leftSection={<IconSearch size={13} />}
            />
          </Box>

          <ScrollArea mah={240}>
            <UnstyledButton
              style={{
                width: '100%',
                padding: `${spacing.sm}px ${spacing.md}px`,
                display: 'block',
              }}
              onClick={() => {
                onChange(null);
                setOpen(false);
                setSearch('');
              }}
            >
              <Text size="sm" c="dimmed" fs="italic">
                {t('feature.accounts.add.institutionPicker.none', 'No institution')}
              </Text>
            </UnstyledButton>
            {filtered.map((inst) => (
              <UnstyledButton
                key={inst.id}
                style={{
                  width: '100%',
                  padding: `${spacing.sm}px ${spacing.md}px`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                  background:
                    value === inst.id
                      ? `color-mix(in oklab, ${colors.primary} 7%, ${colors.white})`
                      : undefined,
                  borderTop: `1px solid ${colors.paleGrey}`,
                }}
                onClick={() => {
                  onChange(inst.id);
                  setOpen(false);
                  setSearch('');
                }}
              >
                <Avatar src={inst.image_src} size={24} radius="xs" />
                <Text size="sm" style={{ flex: 1 }}>
                  {inst.name}
                </Text>
                {value === inst.id && <IconCheck size={14} color={colors.primary} />}
              </UnstyledButton>
            ))}
          </ScrollArea>
        </Card>
      )}
    </Box>
  );
}
