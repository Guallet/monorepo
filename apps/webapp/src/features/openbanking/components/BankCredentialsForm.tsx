import {
  BankConnectionDto,
  BankCredentialsRequestDto,
  BankProviderDto,
} from '@guallet/api-client';
import { useBankConnectionMutations } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
  Alert,
  Button,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

interface BankCredentialsFormProps {
  provider: BankProviderDto;
  connection?: BankConnectionDto;
  disabled?: boolean;
  continueToAccounts?: boolean;
  onSaved: () => void;
  onCancel: () => void;
  onSavingChange?: (saving: boolean) => void;
}

export function BankCredentialsForm({
  provider,
  connection,
  disabled,
  continueToAccounts,
  onSaved,
  onCancel,
  onSavingChange,
}: Readonly<BankCredentialsFormProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { create, replaceCredentials } = useBankConnectionMutations();
  const [failed, setFailed] = useState(false);
  const labels = {
    apiKey: connection
      ? t('openbanking.credentials.newApiKey', 'New API key')
      : t('openbanking.credentials.apiKey', 'API key or personal access token'),
    secretId: t('openbanking.credentials.secretId', 'Secret ID'),
    secretKey: t('openbanking.credentials.secretKey', 'Secret key'),
  };
  const form = useForm({
    initialValues: { apiKey: '', secretId: '', secretKey: '' },
    validate: zod4Resolver(
      z
        .object({
          apiKey: z.string(),
          secretId: z.string(),
          secretKey: z.string(),
        })
        .superRefine((values, context) => {
          for (const field of provider.credentialFields) {
            if (!values[field.name].trim() || values[field.name].length > 4096)
              context.addIssue({
                code: 'custom',
                path: [field.name],
                message: t(
                  'openbanking.credentials.required',
                  'Enter a valid credential.',
                ),
              });
          }
        }),
    ),
  });
  const saving = create.isPending || replaceCredentials.isPending;
  async function save(values: typeof form.values) {
    if (saving || disabled) return;
    setFailed(false);
    onSavingChange?.(true);
    const credentials: BankCredentialsRequestDto = Object.fromEntries(
      provider.credentialFields.map((field) => [
        field.name,
        values[field.name].trim(),
      ]),
    );
    try {
      if (connection)
        await replaceCredentials.mutateAsync({
          id: connection.id,
          credentials,
        });
      else await create.mutateAsync({ providerId: provider.id, credentials });
      form.reset();
      notifications.show({
        message: t(
          'openbanking.credentials.saved',
          'Credentials validated and saved.',
        ),
        color: 'green',
      });
      onSaved();
    } catch {
      setFailed(true);
    } finally {
      create.reset();
      replaceCredentials.reset();
      onSavingChange?.(false);
    }
  }
  return (
    <form onSubmit={form.onSubmit(save)}>
      <Stack gap={spacing.md}>
        {connection ? (
          <Text size="sm" c="dimmed">
            {t(
              'openbanking.credentials.replacementHelp',
              'Your current key stays active until the replacement is validated.',
            )}
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            {t(
              'openbanking.credentials.help',
              'Use credentials from your own provider account. They are encrypted before being saved.',
            )}
          </Text>
        )}
        {provider.credentialFields.map((field) =>
          field.secret ? (
            <PasswordInput
              key={field.name}
              label={labels[field.name]}
              autoComplete="new-password"
              required
              disabled={saving || disabled}
              {...form.getInputProps(field.name)}
            />
          ) : (
            <TextInput
              key={field.name}
              label={labels[field.name]}
              autoComplete="off"
              required
              disabled={saving || disabled}
              {...form.getInputProps(field.name)}
            />
          ),
        )}
        {failed && (
          <Alert color="red" role="alert">
            {t(
              'openbanking.credentials.saveError',
              'Could not save credentials. Check your provider details and try again.',
            )}
          </Alert>
        )}
        <Group justify="flex-end">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button type="submit" loading={saving} disabled={disabled}>
            {connection
              ? t('openbanking.credentials.replace', 'Validate and replace')
              : continueToAccounts
                ? t('openbanking.credentials.continue', 'Validate and continue')
                : t('openbanking.credentials.save', 'Save and validate')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
