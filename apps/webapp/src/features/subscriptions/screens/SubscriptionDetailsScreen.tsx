import { AppSection } from '@/components/Cards/AppSection';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { RecurringPaymentType, RecurrenceCadence } from '@guallet/api-client';
import {
  useAccounts,
  useSubscription,
  useSubscriptionsMutations,
} from '@guallet/api-react';
import { Money } from '@guallet/money';
import { useTheme } from '@guallet/ui-react';
import {
  Stack,
  Group,
  Button,
  Text,
  Avatar,
  Badge,
  Modal,
  Divider,
  ThemeIcon,
  Box,
  Card,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate, notFound } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconEdit,
  IconTrash,
  IconArrowLeft,
  IconRepeat,
  IconCalendar,
  IconCurrencyPound,
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconBuildingBank,
} from '@tabler/icons-react';

interface SubscriptionDetailsScreenProps {
  subscriptionId: string;
}

function getPaymentTypeColor(
  type: RecurringPaymentType,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  switch (type) {
    case RecurringPaymentType.SUBSCRIPTION:
      return colors.primary;
    case RecurringPaymentType.REGULAR_PAYMENT:
      return colors.warning;
    case RecurringPaymentType.REGULAR_INCOME:
      return colors.support;
    default:
      return colors.midGrey;
  }
}

function getPaymentTypeLabel(
  type: RecurringPaymentType,
  t: (key: string, fallback: string) => string,
): string {
  switch (type) {
    case RecurringPaymentType.SUBSCRIPTION:
      return t('screens.subscriptions.list.types.subscription', 'Subscription');
    case RecurringPaymentType.REGULAR_PAYMENT:
      return t(
        'screens.subscriptions.list.types.regularPayment',
        'Regular payment',
      );
    case RecurringPaymentType.REGULAR_INCOME:
      return t(
        'screens.subscriptions.list.types.regularIncome',
        'Regular income',
      );
    default:
      return t('screens.subscriptions.list.types.unknown', 'Unknown');
  }
}

function getCadenceLabel(
  cadence: RecurrenceCadence,
  t: (key: string, fallback: string) => string,
): string {
  switch (cadence) {
    case RecurrenceCadence.WEEKLY:
      return t('screens.subscriptions.list.cadence.weekly', 'Weekly');
    case RecurrenceCadence.BIWEEKLY:
      return t('screens.subscriptions.list.cadence.biweekly', 'Bi-weekly');
    case RecurrenceCadence.MONTHLY:
      return t('screens.subscriptions.list.cadence.monthly', 'Monthly');
    case RecurrenceCadence.QUARTERLY:
      return t('screens.subscriptions.list.cadence.quarterly', 'Quarterly');
    case RecurrenceCadence.YEARLY:
      return t('screens.subscriptions.list.cadence.yearly', 'Yearly');
    default:
      return t('screens.subscriptions.list.cadence.unknown', 'Unknown');
  }
}

function calculateMonthlyAmount(
  amount: number,
  cadence: RecurrenceCadence,
): number {
  switch (cadence) {
    case RecurrenceCadence.WEEKLY:
      return (amount * 52) / 12;
    case RecurrenceCadence.BIWEEKLY:
      return (amount * 26) / 12;
    case RecurrenceCadence.MONTHLY:
      return amount;
    case RecurrenceCadence.QUARTERLY:
      return amount / 3;
    case RecurrenceCadence.YEARLY:
      return amount / 12;
    default:
      return amount;
  }
}

function calculateYearlyAmount(
  amount: number,
  cadence: RecurrenceCadence,
): number {
  switch (cadence) {
    case RecurrenceCadence.WEEKLY:
      return amount * 52;
    case RecurrenceCadence.BIWEEKLY:
      return amount * 26;
    case RecurrenceCadence.MONTHLY:
      return amount * 12;
    case RecurrenceCadence.QUARTERLY:
      return amount * 4;
    case RecurrenceCadence.YEARLY:
      return amount;
    default:
      return amount;
  }
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

function DetailRow({ label, value, icon }: Readonly<DetailRowProps>) {
  const { colors } = useTheme();
  return (
    <Group justify="space-between" py="xs">
      <Group gap="xs">
        {icon && <Box style={{ color: colors.midGrey }}>{icon}</Box>}
        <Text size="sm" c="dimmed">
          {label}
        </Text>
      </Group>
      <Box>{value}</Box>
    </Group>
  );
}

export function SubscriptionDetailsScreen({
  subscriptionId,
}: Readonly<SubscriptionDetailsScreenProps>) {
  const { t } = useTranslation();
  const navigation = useNavigate();
  const { subscription, isLoading } = useSubscription(subscriptionId);
  const { deleteSubscriptionMutation } = useSubscriptionsMutations();
  const { accounts } = useAccounts();
  const { colors, spacing } = useTheme();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  async function handleDelete() {
    try {
      await deleteSubscriptionMutation.mutateAsync({ id: subscriptionId });
      notifications.show({
        message: t(
          'screens.subscriptions.details.notifications.deleted',
          'Subscription deleted.',
        ),
        color: 'green',
      });
      navigation({ to: '/subscriptions' });
    } catch (error) {
      console.error('Error deleting subscription', error);
      notifications.show({
        title: t(
          'screens.subscriptions.details.notifications.deleteError.title',
          'Error',
        ),
        message: t(
          'screens.subscriptions.details.notifications.deleteError.message',
          'Failed to delete subscription.',
        ),
        color: 'red',
      });
    }
  }

  if (!subscription && !isLoading) {
    throw notFound();
  }

  const linkedAccount = subscription?.accountId
    ? accounts.find((a) => a.id === subscription.accountId)
    : null;

  const isIncome = subscription?.type === RecurringPaymentType.REGULAR_INCOME;
  const amountColor = isIncome ? colors.support : colors.error;
  const typeColor = subscription
    ? getPaymentTypeColor(subscription.type, colors)
    : colors.midGrey;

  const monthlyAmount = subscription
    ? calculateMonthlyAmount(subscription.amount, subscription.cadence)
    : 0;
  const yearlyAmount = subscription
    ? calculateYearlyAmount(subscription.amount, subscription.cadence)
    : 0;

  return (
    <BaseScreen
      isLoading={isLoading}
      title={
        subscription?.name ??
        t('screens.subscriptions.details.title', 'Subscription')
      }
    >
      <Modal
        centered
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t(
          'screens.subscriptions.details.deleteModal.title',
          'Delete subscription',
        )}
        radius="lg"
        size="sm"
      >
        <Stack gap={spacing.md}>
          <Group gap="sm">
            <ThemeIcon size={40} radius="xl" color="red" variant="light">
              <IconAlertTriangle size={20} strokeWidth={1.5} />
            </ThemeIcon>
            <Stack gap={2} style={{ flex: 1 }}>
              <Text fw={600} size="sm">
                {t(
                  'screens.subscriptions.details.deleteModal.heading',
                  'Are you sure?',
                )}
              </Text>
              <Text size="sm" c="dimmed">
                {t(
                  'screens.subscriptions.details.deleteModal.description',
                  'This action cannot be undone.',
                )}
              </Text>
            </Stack>
          </Group>
          <Group justify="flex-end" gap="xs">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              {t(
                'screens.subscriptions.details.deleteModal.cancelButton',
                'Cancel',
              )}
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              loading={deleteSubscriptionMutation.isPending}
              leftSection={<IconTrash size={16} strokeWidth={1.5} />}
            >
              {t(
                'screens.subscriptions.details.deleteModal.confirmButton',
                'Delete',
              )}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {subscription && (
        <Stack gap={spacing.lg} maw={600} mx="auto">
          {/* Hero header */}
          <Card withBorder shadow="sm" radius="lg" padding="lg">
            <Stack gap={spacing.md} align="center">
              <Avatar
                src={subscription.imageUrl}
                radius="xl"
                size={72}
                style={{ border: `3px solid ${typeColor}33` }}
              >
                <Text fw={800} size="xl" style={{ color: typeColor }}>
                  {subscription.name.charAt(0).toUpperCase()}
                </Text>
              </Avatar>

              <Stack gap={4} align="center">
                <Text size="xl" fw={700} style={{ letterSpacing: '-0.01em' }}>
                  {subscription.name}
                </Text>
                <Badge
                  size="md"
                  radius="sm"
                  variant="light"
                  style={{
                    backgroundColor: `${typeColor}18`,
                    color: typeColor,
                  }}
                >
                  {getPaymentTypeLabel(subscription.type, t)}
                </Badge>
              </Stack>

              <Text
                fw={800}
                fz={32}
                style={{
                  color: amountColor,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                }}
              >
                {Money.fromCurrencyCode({
                  currencyCode: subscription.currency,
                  amount: subscription.amount,
                }).format()}
              </Text>

              <Text size="sm" c="dimmed">
                {getCadenceLabel(subscription.cadence, t)}
              </Text>
            </Stack>
          </Card>

          {/* Details */}
          <AppSection
            title={t(
              'screens.subscriptions.details.sections.details',
              'Details',
            )}
          >
            <Stack gap={0}>
              <DetailRow
                icon={<IconRefresh size={16} strokeWidth={1.5} />}
                label={t(
                  'screens.subscriptions.details.fields.frequency',
                  'Frequency',
                )}
                value={
                  <Text size="sm" fw={500}>
                    {getCadenceLabel(subscription.cadence, t)}
                  </Text>
                }
              />
              <Divider />
              <DetailRow
                icon={<IconCalendar size={16} strokeWidth={1.5} />}
                label={t(
                  'screens.subscriptions.details.fields.startDate',
                  'Start date',
                )}
                value={
                  <Text size="sm" fw={500}>
                    {subscription.startDate
                      ? new Date(subscription.startDate).toLocaleDateString(
                          'en-GB',
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          },
                        )
                      : '—'}
                  </Text>
                }
              />
              <Divider />
              <DetailRow
                icon={<IconCurrencyPound size={16} strokeWidth={1.5} />}
                label={t(
                  'screens.subscriptions.details.fields.currency',
                  'Currency',
                )}
                value={
                  <Text size="sm" fw={500}>
                    {subscription.currency}
                  </Text>
                }
              />
              <Divider />
              <DetailRow
                icon={<IconRepeat size={16} strokeWidth={1.5} />}
                label={t('screens.subscriptions.details.fields.type', 'Type')}
                value={
                  <Badge
                    size="sm"
                    radius="sm"
                    variant="light"
                    style={{
                      backgroundColor: `${typeColor}18`,
                      color: typeColor,
                    }}
                  >
                    {getPaymentTypeLabel(subscription.type, t)}
                  </Badge>
                }
              />
              {linkedAccount && (
                <>
                  <Divider />
                  <DetailRow
                    icon={<IconBuildingBank size={16} strokeWidth={1.5} />}
                    label={t(
                      'screens.subscriptions.details.fields.account',
                      'Account',
                    )}
                    value={
                      <Text size="sm" fw={500}>
                        {linkedAccount.name}
                      </Text>
                    }
                  />
                </>
              )}
            </Stack>
          </AppSection>

          {/* Cost summary */}
          <AppSection
            title={t(
              'screens.subscriptions.details.sections.costSummary',
              'Cost summary',
            )}
          >
            <Stack gap={0}>
              <DetailRow
                icon={
                  isIncome ? (
                    <IconTrendingUp size={16} strokeWidth={1.5} />
                  ) : (
                    <IconTrendingDown size={16} strokeWidth={1.5} />
                  )
                }
                label={t(
                  'screens.subscriptions.details.costSummary.monthly',
                  'Monthly estimate',
                )}
                value={
                  <Text
                    size="sm"
                    fw={600}
                    style={{
                      color: amountColor,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {Money.fromCurrencyCode({
                      currencyCode: subscription.currency,
                      amount: monthlyAmount,
                    }).format()}
                  </Text>
                }
              />
              <Divider />
              <DetailRow
                icon={
                  isIncome ? (
                    <IconTrendingUp size={16} strokeWidth={1.5} />
                  ) : (
                    <IconTrendingDown size={16} strokeWidth={1.5} />
                  )
                }
                label={t(
                  'screens.subscriptions.details.costSummary.yearly',
                  'Yearly estimate',
                )}
                value={
                  <Text
                    size="sm"
                    fw={600}
                    style={{
                      color: amountColor,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {Money.fromCurrencyCode({
                      currencyCode: subscription.currency,
                      amount: yearlyAmount,
                    }).format()}
                  </Text>
                }
              />
            </Stack>
          </AppSection>

          {/* Actions */}
          <Stack gap="xs" hiddenFrom="sm">
            <Button
              fullWidth
              size="md"
              leftSection={<IconEdit size={16} strokeWidth={1.5} />}
              onClick={() =>
                navigation({
                  to: '/subscriptions/$id/edit',
                  params: { id: subscription.id },
                })
              }
            >
              {t(
                'screens.subscriptions.details.actions.edit',
                'Edit subscription',
              )}
            </Button>
            <Button
              fullWidth
              size="md"
              variant="outline"
              color="red"
              leftSection={<IconTrash size={16} strokeWidth={1.5} />}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              {t(
                'screens.subscriptions.details.actions.delete',
                'Delete subscription',
              )}
            </Button>
            <Button
              fullWidth
              variant="subtle"
              leftSection={<IconArrowLeft size={16} strokeWidth={1.5} />}
              onClick={() => navigation({ to: '/subscriptions' })}
            >
              {t('screens.subscriptions.details.actions.back', 'Back to list')}
            </Button>
          </Stack>

          <Group justify="space-between" visibleFrom="sm">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} strokeWidth={1.5} />}
              onClick={() => navigation({ to: '/subscriptions' })}
            >
              {t('screens.subscriptions.details.actions.back', 'Back to list')}
            </Button>
            <Group gap="xs">
              <Button
                variant="outline"
                color="red"
                leftSection={<IconTrash size={16} strokeWidth={1.5} />}
                onClick={() => setIsDeleteModalOpen(true)}
              >
                {t('screens.subscriptions.details.actions.delete', 'Delete')}
              </Button>
              <Button
                leftSection={<IconEdit size={16} strokeWidth={1.5} />}
                onClick={() =>
                  navigation({
                    to: '/subscriptions/$id/edit',
                    params: { id: subscription.id },
                  })
                }
              >
                {t(
                  'screens.subscriptions.details.actions.edit',
                  'Edit subscription',
                )}
              </Button>
            </Group>
          </Group>
        </Stack>
      )}
    </BaseScreen>
  );
}
