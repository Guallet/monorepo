import { ObInstitutionDto } from '@guallet/api-client';
import { useTheme } from '@guallet/ui-react';
import { Avatar, Button, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconArrowRight, IconBuildingBank } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { WizardProgress } from './WizardProgress';

interface StepOBRedirectProps {
  institution: ObInstitutionDto;
  onInitiate: () => void;
  isLoading: boolean;
}

export function StepOBRedirect({
  institution,
  onInitiate,
  isLoading,
}: Readonly<StepOBRedirectProps>) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Stack align="center">
      <WizardProgress
        steps={[
          t('feature.accounts.add.obSteps.country', 'Country'),
          t('feature.accounts.add.obSteps.bank', 'Bank'),
          t('feature.accounts.add.obSteps.connecting', 'Connecting'),
        ]}
        current={2}
      />

      <Group gap="xl" justify="center" my="xl">
        <Avatar src={institution.logo} size={64} radius="sm" color="blue">
          {institution.name.slice(0, 2).toUpperCase()}
        </Avatar>
        <Group gap="xs">
          <IconArrowRight size={20} color={colors.primary} style={{ opacity: 0.3 }} />
          <IconArrowRight size={20} color={colors.primary} style={{ opacity: 0.6 }} />
          <IconArrowRight size={20} color={colors.primary} />
        </Group>
        <ThemeIcon size={64} radius="sm" color="blue" variant="filled">
          <IconBuildingBank size={32} />
        </ThemeIcon>
      </Group>

      <Title order={4} ta="center">
        {t('feature.accounts.add.obRedirect.title', 'Connecting to {{bank}}', {
          bank: institution.name,
        })}
      </Title>
      <Text size="sm" c="dimmed" ta="center" maw={360}>
        {t(
          'feature.accounts.add.obRedirect.subtitle',
          "You'll be redirected to your bank's secure login page. Return to Guallet when done.",
        )}
      </Text>

      <Button fullWidth mt="lg" onClick={onInitiate} loading={isLoading}>
        {t('feature.accounts.add.obRedirect.goToBank', 'Go to {{bank}}', {
          bank: institution.name,
        })}
      </Button>
    </Stack>
  );
}
