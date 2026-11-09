import { BankProviderDto } from '@guallet/api-client';
import {
  useBankConnectionMutations,
  useBankInstitutions,
} from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Alert, Button, Select, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

interface BankAuthorizationFormProps {
  connectionId: string;
  provider: BankProviderDto;
  disabled?: boolean;
}

export function BankAuthorizationForm({
  connectionId,
  provider,
  disabled,
}: Readonly<BankAuthorizationFormProps>) {
  const { t, i18n } = useTranslation();
  const { spacing } = useTheme();
  const form = useForm({
    initialValues: { country: '', institutionId: '' },
    validate: zod4Resolver(
      z.object({
        country: z.string().length(2),
        institutionId: z.string().min(1),
      }),
    ),
  });
  const institutions = useBankInstitutions(connectionId, form.values.country);
  const { authorize } = useBankConnectionMutations();
  const names = new Intl.DisplayNames([i18n.language], { type: 'region' });
  async function connect(values: typeof form.values) {
    if (disabled || authorize.isPending) return;
    try {
      const response = await authorize.mutateAsync({
        id: connectionId,
        request: {
          institutionId: values.institutionId,
          redirectUrl: `${window.location.origin}/bank-connections/callback`,
        },
      });
      const url = new URL(response.redirectUrl);
      if (url.protocol !== 'https:')
        throw new Error('Invalid bank authorization URL');
      window.location.assign(url.toString());
    } catch {
      form.setErrors({
        institutionId: t(
          'openbanking.authorization.startError',
          'Could not start bank authorization. Please try again.',
        ),
      });
    }
  }
  return (
    <form onSubmit={form.onSubmit(connect)}>
      <Stack gap={spacing.sm}>
        <Select
          label={t('openbanking.authorization.country', 'Country')}
          searchable
          disabled={disabled || authorize.isPending}
          error={form.errors.country}
          data={provider.supportedCountries.map((code) => ({
            value: code,
            label: names.of(code) ?? code,
          }))}
          value={form.values.country}
          onChange={(value) =>
            form.setValues({ country: value ?? '', institutionId: '' })
          }
        />
        <Select
          label={t('openbanking.authorization.bank', 'Bank')}
          searchable
          data={(institutions.data ?? []).map((bank) => ({
            value: bank.id,
            label: bank.name,
          }))}
          disabled={
            disabled ||
            authorize.isPending ||
            institutions.isFetching ||
            !form.values.country
          }
          {...form.getInputProps('institutionId')}
        />
        {institutions.isError && (
          <Alert color="red">
            {t('openbanking.authorization.loadError', 'Could not load banks.')}
            <Button
              variant="subtle"
              onClick={() => void institutions.refetch()}
            >
              {t('common.retry', 'Retry')}
            </Button>
          </Alert>
        )}
        <Button
          type="submit"
          loading={authorize.isPending}
          disabled={disabled || !form.values.institutionId}
        >
          {t('openbanking.authorization.connect', 'Authorize a bank')}
        </Button>
      </Stack>
    </form>
  );
}
