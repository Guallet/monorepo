import { useTheme } from '@guallet/ui-react';
import { Avatar, Box, Button, Card, Center, Group, Stack, Text, Title } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconCheck } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { Currency } from '@guallet/money';
import { useTranslation } from 'react-i18next';
import { getAccountTypeTitleSingular } from '../../models/Account';
import { AddAccountFormData } from '../../screens/addAccountFormSchema';

interface StepManualSuccessProps {
  form: UseFormReturnType<AddAccountFormData>;
  accountId: string | null;
  onDone: () => void;
  onAddAnother: () => void;
}

export function StepManualSuccess({
  form,
  accountId,
  onDone,
  onAddAnother,
}: Readonly<StepManualSuccessProps>) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const navigate = useNavigate();

  const currencyValue = form.values.currency;
  const currency = currencyValue ? Currency.fromISOCode(currencyValue) : null;
  const balance = form.values.balance ?? 0;
  const typeMeta = getAccountTypeTitleSingular(form.values.account_type);

  function handleGoToAccount() {
    if (accountId) {
      navigate({ to: '/accounts/$id', params: { id: accountId } });
    } else {
      onDone();
    }
  }

  return (
    <Stack align="center">
      <Center
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: `color-mix(in oklab, ${colors.success} 14%, ${colors.white})`,
          border: `2px solid color-mix(in oklab, ${colors.success} 30%, ${colors.white})`,
        }}
      >
        <IconCheck size={36} color={colors.success} />
      </Center>

      <Title order={3} ta="center">
        {t('feature.accounts.add.success.title', 'Account added!')}
      </Title>
      <Text size="sm" c="dimmed" ta="center">
        {t('feature.accounts.add.success.subtitle', '"{{name}}" has been added to your Guallet.', {
          name: form.values.name || t('feature.accounts.add.success.newAccount', 'New account'),
        })}
      </Text>

      <Card withBorder radius="lg" shadow="sm" p="md" w="100%">
        <Group gap="sm">
          <Avatar size={48} radius="sm" color="blue">
            {(form.values.name || 'A').slice(0, 2).toUpperCase()}
          </Avatar>
          <Box style={{ flex: 1 }}>
            <Text fw={700}>
              {form.values.name || t('feature.accounts.add.success.newAccount', 'New account')}
            </Text>
            <Text size="xs" c="dimmed" mt={spacing.xs / 2}>
              {typeMeta} · {form.values.currency || 'GBP'}
            </Text>
          </Box>
          <Text
            fw={700}
            size="lg"
            style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}
            c={balance < 0 ? colors.error : undefined}
          >
            {balance < 0 ? '−' : ''}
            {currency?.symbol}
            {Math.abs(balance).toFixed(2)}
          </Text>
        </Group>
      </Card>

      <Stack gap="xs" w="100%" mt="md">
        <Button fullWidth onClick={handleGoToAccount}>
          {t('feature.accounts.add.success.goToAccounts', 'Go to Accounts')}
        </Button>
        <Button fullWidth variant="outline" onClick={onAddAnother}>
          {t('feature.accounts.add.success.addAnother', 'Add another account')}
        </Button>
      </Stack>
    </Stack>
  );
}
