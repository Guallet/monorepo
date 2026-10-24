import {
  Alert,
  Button,
  Card,
  Group,
  NumberInput,
  PasswordInput,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@guallet/ui-react';
import {
  CreateDecisionConnectionRequest,
  DecisionAuthType,
  DecisionConnectionDto,
} from '@guallet/api-client';
interface Props {
  connection: DecisionConnectionDto | null;
  busy: boolean;
  onSave: (request: CreateDecisionConnectionRequest) => void;
  onTest: (request?: CreateDecisionConnectionRequest) => void;
}
export function DecisionConnectionForm({
  connection,
  busy,
  onSave,
  onTest,
}: Readonly<Props>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const required = t('classification.validation.required', 'Required');
  const schema = z.object({
    displayName: z.string().trim().min(1, required).max(80),
    baseUrl: z
      .url(t('classification.validation.url', 'Enter a valid API URL'))
      .max(2048),
    model: z.string().min(1, required).max(100),
    authType: z.enum(['none', 'bearer', 'header', 'basic']),
    authHeaderName: z.string(),
    secret: z.string().max(4096),
    clientId: z.string().max(1024),
    minConfidence: z.number().min(0).max(1),
    minMargin: z.number().min(0).max(1),
    sendNotes: z.boolean(),
    isActive: z.boolean(),
  });
  const form = useForm({
    initialValues: {
      displayName: connection?.displayName ?? '',
      baseUrl: connection?.baseUrl ?? '',
      model: connection?.model ?? 'jev-latest',
      authType: (connection?.authType ?? 'none') as DecisionAuthType,
      authHeaderName: connection?.authHeaderName ?? 'x-api-key',
      secret: '',
      clientId: '',
      minConfidence: connection?.minConfidence ?? 0.7,
      minMargin: connection?.minMargin ?? 0.1,
      sendNotes: connection?.sendNotes ?? false,
      isActive: connection?.isActive ?? true,
    },
    validate: zod4Resolver(schema),
  });
  function request(): CreateDecisionConnectionRequest {
    const { secret, clientId, authHeaderName, ...values } = form.values;
    const credentialFields: Partial<Record<DecisionAuthType, string>> = {
      bearer: 'apiKey',
      header: 'headerValue',
      basic: 'clientSecret',
    };
    const credentialField = credentialFields[values.authType];
    return {
      ...values,
      ...(values.authType === 'header' ? { authHeaderName } : {}),
      ...(clientId ? { clientId } : {}),
      ...(secret && credentialField ? { [credentialField]: secret } : {}),
    };
  }
  return (
    <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
      <form onSubmit={form.onSubmit(() => onSave(request()))}>
        <Stack gap={spacing.md}>
          <Alert>
            {t(
              'classification.privacy',
              'When enabled, uncategorised transaction descriptions, currency, direction and category names are sent to your chosen service. Known sensitive patterns are masked, but text may still contain personal information. Notes are only sent if you enable them. Every suggestion needs your review.',
            )}
          </Alert>
          <TextInput
            label={t('classification.name', 'Connection name')}
            required
            {...form.getInputProps('displayName')}
          />
          <TextInput
            label={t('classification.url', 'API base URL')}
            description={t(
              'classification.urlHelp',
              'Enter the base URL ending in /v1.',
            )}
            required
            {...form.getInputProps('baseUrl')}
          />
          <TextInput
            label={t('classification.model', 'Model')}
            required
            {...form.getInputProps('model')}
          />
          <Select
            label={t('classification.auth.label', 'Authentication')}
            allowDeselect={false}
            data={[
              { value: 'none', label: t('classification.auth.none', 'None') },
              {
                value: 'bearer',
                label: t('classification.auth.bearer', 'Bearer token'),
              },
              {
                value: 'header',
                label: t('classification.auth.header', 'API key header'),
              },
              {
                value: 'basic',
                label: t('classification.auth.basic', 'Username and password'),
              },
            ]}
            {...form.getInputProps('authType')}
          />
          {form.values.authType === 'header' && (
            <TextInput
              label={t('classification.header', 'Header name')}
              description={t(
                'classification.headerHelp',
                'Use an x- header ending in key or token, such as x-api-key.',
              )}
              {...form.getInputProps('authHeaderName')}
            />
          )}
          {form.values.authType === 'basic' && (
            <TextInput
              label={t('classification.username', 'Username')}
              autoComplete="off"
              {...form.getInputProps('clientId')}
            />
          )}
          {form.values.authType !== 'none' && (
            <PasswordInput
              label={t('classification.secret', 'Credential')}
              autoComplete="new-password"
              description={
                connection?.hasCredentials
                  ? t(
                      'classification.secretKeep',
                      'Leave empty to keep the saved credential. Change authentication to None to remove it.',
                    )
                  : undefined
              }
              {...form.getInputProps('secret')}
            />
          )}
          <NumberInput
            label={t('classification.threshold', 'Minimum suggestion score')}
            min={0}
            max={1}
            step={0.05}
            {...form.getInputProps('minConfidence')}
          />
          <NumberInput
            label={t(
              'classification.margin',
              'Minimum gap from the next category',
            )}
            min={0}
            max={1}
            step={0.05}
            {...form.getInputProps('minMargin')}
          />
          <Text size="sm" c="dimmed">
            {t(
              'classification.scoreHelp',
              'Scores are provider estimates, not measured accuracy.',
            )}
          </Text>
          <Switch
            label={t('classification.notes', 'Share transaction notes')}
            {...form.getInputProps('sendNotes', { type: 'checkbox' })}
          />
          <Switch
            label={t('classification.active', 'Enable background suggestions')}
            {...form.getInputProps('isActive', { type: 'checkbox' })}
          />
          <Group>
            <Button type="submit" loading={busy}>
              {t('classification.save', 'Save and test')}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => {
                if (connection) onTest();
                else if (!form.validate().hasErrors) onTest(request());
              }}
            >
              {connection
                ? t('classification.testSaved', 'Test saved connection')
                : t('classification.test', 'Test connection')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
