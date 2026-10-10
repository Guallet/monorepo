import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  useCategory,
  useSubscription,
  useSubscriptionsMutations,
} from '@guallet/api-react';
import { BottomSheet, Button, useTheme, useToast } from '@guallet/luna-mobile';
import { RecurringPaymentType } from '@guallet/api-client';
import { formatPreferenceDate } from '@/utils/formatPreferenceDate';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import {
  cadenceLabel,
  nextPaymentDate,
  parseCalendarDate,
  typeLabel,
  yearlyEstimate,
} from '../recurring';
import {
  Amount,
  Avatar,
  Card,
  Copy,
  DetailValue,
  Loading,
  RecurringScreen,
  Status,
} from '../components/RecurringComponents';

export default function RecurringDetailScreen({
  id,
}: Readonly<{ id: string }>) {
  const router = useRouter();
  const toast = useToast();
  const { spacing, colors, borderRadius } = useTheme();
  const { dateFormat } = useMobileUserPreferences();
  const {
    subscription: item,
    isLoading,
    isError,
    error,
    refetch,
  } = useSubscription(id);
  const { category, isError: categoryError } = useCategory(
    item?.categoryId ?? null,
  );
  const { deleteSubscriptionMutation } = useSubscriptionsMutations();
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeError, setRemoveError] = useState(false);
  const pending = deleteSubscriptionMutation.isPending;
  async function remove() {
    if (pending) return;
    setRemoveError(false);
    try {
      await deleteSubscriptionMutation.mutateAsync({ id });
      setRemoveOpen(false);
      toast.success('Recurring item removed');
      router.dismissTo('/recurring');
    } catch {
      setRemoveError(true);
    }
  }
  const closeRemove = () => setRemoveOpen(false);
  if (isLoading)
    return (
      <RecurringScreen title="Recurring item">
        <Loading />
      </RecurringScreen>
    );
  const notFound = Boolean(error && 'status' in error && error.status === 404);
  if (isError && !notFound && !item)
    return (
      <RecurringScreen title="Recurring item">
        <View style={{ padding: spacing.md }}>
          <Status
            title="Couldn’t load this item"
            message="Check your connection and try again."
            action="Try again"
            onPress={() => void refetch()}
          />
        </View>
      </RecurringScreen>
    );
  if (!item || notFound)
    return (
      <RecurringScreen title="Recurring item">
        <View style={{ padding: spacing.md }}>
          <Status
            title="Item no longer available"
            message="It may have been removed from Guallet."
            action="Back to recurring"
            onPress={() => router.dismissTo('/recurring')}
          />
        </View>
      </RecurringScreen>
    );
  const date = nextPaymentDate(item, new Date());
  const anchor = parseCalendarDate(item.startDate);
  let dateText = 'Date not set';
  if (date) dateText = formatPreferenceDate(date, dateFormat);
  let anchorText = 'Date not set';
  if (anchor) anchorText = formatPreferenceDate(anchor, dateFormat);
  let categoryText = 'No category';
  if (item.categoryId) categoryText = category?.name ?? 'Category unavailable';
  if (categoryError && item.categoryId) categoryText = 'Couldn’t load category';
  let removeMessage =
    'This removes its schedule from Guallet. Your payments will continue.';
  if (item.type === RecurringPaymentType.SUBSCRIPTION)
    removeMessage = `This removes its schedule from Guallet. Your subscription with ${item.name} will continue.`;
  let estimates: { month: number; year: number } | null = null;
  try {
    const annual = yearlyEstimate(item);
    estimates = { month: annual.divide(12).amount, year: annual.amount };
  } catch {
    /* Legacy currencies remain editable. */
  }
  return (
    <RecurringScreen
      title={typeLabel(item.type)}
      headerRight={() => (
        <Button
          style={styles.headerButton}
          variant="subtle"
          onClick={() =>
            router.push({ pathname: '/recurring/[id]/edit', params: { id } })
          }
        >
          Edit
        </Button>
      )}
    >
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
      >
        <View style={[styles.hero, { gap: spacing.sm }]}>
          <Avatar item={item} large />
          <Copy heading>{item.name}</Copy>
          <Amount item={item} large />
          <Copy muted>{cadenceLabel(item.cadence)}</Copy>
        </View>
        {isError && (
          <Status
            title="Couldn’t refresh this item"
            message="Showing its last loaded schedule."
            action="Try again"
            onPress={() => void refetch()}
          />
        )}
        <Card>
          <View style={{ gap: spacing.sm }}>
            <Copy muted>Next expected payment</Copy>
            <Copy heading>{dateText}</Copy>
            {!date && (
              <Copy muted>
                Add a first payment date to see upcoming payments.
              </Copy>
            )}
          </View>
        </Card>
        <Card>
          <View style={{ gap: spacing.md }}>
            <DetailValue label="Type">
              <Copy>{typeLabel(item.type)}</Copy>
            </DetailValue>
            <DetailValue label="Category">
              <Copy>{categoryText}</Copy>
            </DetailValue>
            <DetailValue label="First payment date">
              <Copy>{anchorText}</Copy>
            </DetailValue>
            <DetailValue label="Currency">
              <Copy>{item.currency}</Copy>
            </DetailValue>
          </View>
        </Card>
        {estimates && (
          <Card>
            <View style={{ gap: spacing.md }}>
              <Copy heading>Cost estimates</Copy>
              <DetailValue label="Monthly">
                <Amount item={item} amount={estimates.month} />
              </DetailValue>
              <DetailValue label="Yearly">
                <Amount item={item} amount={estimates.year} />
              </DetailValue>
            </View>
          </Card>
        )}
        <Button
          style={styles.actionButton}
          variant="outline"
          onClick={() => {
            setRemoveError(false);
            setRemoveOpen(true);
          }}
        >
          Delete
        </Button>
      </ScrollView>
      <BottomSheet
        isOpen={removeOpen}
        title={`Remove ${item.name}?`}
        showCloseIcon={!pending}
        onClose={closeRemove}
      >
        <View style={{ gap: spacing.md, padding: spacing.md }}>
          <Copy muted>{removeMessage}</Copy>
          {removeError && (
            <Copy error>Couldn’t remove this item. Please try again.</Copy>
          )}
          <Button
            accessibilityLabel="Confirm removal from Guallet"
            disabled={pending}
            onClick={() => void remove()}
            style={{
              ...styles.actionButton,
              backgroundColor: colors.status.error,
              borderRadius: borderRadius.md,
            }}
          >
            <Text style={{ color: colors.text.inverse, fontWeight: '600' }}>
              {pending && 'Removing…'}
              {!pending && 'Delete'}
            </Text>
          </Button>
          <Button
            disabled={pending}
            onClick={closeRemove}
            variant="outline"
            style={styles.actionButton}
          >
            Keep item
          </Button>
        </View>
      </BottomSheet>
    </RecurringScreen>
  );
}
const styles = StyleSheet.create({
  hero: { alignItems: 'center' },
  headerButton: { minWidth: 44 },
  actionButton: { height: 'auto', minHeight: 48, paddingVertical: 12 },
});
