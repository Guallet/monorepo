import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import {
  useAccounts,
  useInstitution,
  useInstitutionMutations,
} from '@guallet/api-react';
import { ApiError } from '@guallet/api-client';
import { BottomSheet, useTheme, useToast } from '@guallet/luna-mobile';
import { BuildingBankIcon, ChevronRightIcon } from '@guallet/luna-mobile/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { getAccountTypeLabel } from '@/features/accounts/models/account';
import { countriesLabel } from '../institutions';
import { institutionError } from '../institutionError';
import {
  InstitutionCard,
  InstitutionLogo,
  InstitutionState,
  InstitutionButton,
  InstitutionText,
  institutionStyles,
} from '../components/InstitutionUi';

export default function InstitutionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { colors, spacing, typography } = useTheme();
  const query = useInstitution(id);
  const accountsQuery = useAccounts();
  const { deleteInstitutionMutation } = useInstitutionMutations();
  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const submission = useRef(false);
  const [removed, setRemoved] = useState(false);
  usePreventRemove(!removed && deleteInstitutionMutation.isPending, () => {});
  useEffect(() => {
    if (removed) router.dismissTo('/institutions');
  }, [removed, router]);
  const institution = query.institution;
  const accounts = accountsQuery.accounts.filter(
    (account) => account.institutionId === id,
  );
  const canDelete =
    Boolean(institution?.user_id) &&
    Boolean(accountsQuery.data) &&
    !accountsQuery.isError &&
    !accountsQuery.isFetching &&
    accounts.length === 0;
  async function remove() {
    if (!canDelete || submission.current) return;
    submission.current = true;
    setDeleteError(null);
    try {
      await deleteInstitutionMutation.mutateAsync({ id });
      setShowDelete(false);
      toast.success('Institution deleted');
      setRemoved(true);
    } catch (error) {
      setDeleteError(institutionError(error, 'delete'));
      if (error instanceof ApiError && error.status === 409)
        void accountsQuery.refetch();
    } finally {
      submission.current = false;
    }
  }
  if (!institution) {
    let title = 'Institution unavailable';
    let body = 'Return to the list or try again.';
    if (query.isLoading) {
      title = 'Loading institution…';
      body = '';
    }
    if (query.isError) title = 'Couldn’t load institution';
    return (
      <AppScreen
        headerTitle="Institution"
        safeAreaEdges={['left', 'right', 'bottom']}
      >
        <View style={{ padding: spacing.md }}>
          <InstitutionState
            title={title}
            body={body}
            loading={query.isLoading}
            action="Try again"
            onAction={() => void query.refetch()}
          />
        </View>
      </AppScreen>
    );
  }
  const custom = typeof institution.user_id === 'string';
  let ownership = 'Shared institution';
  let ownershipHint = 'Available to everyone · Read-only';
  if (custom) {
    ownership = 'Custom institution';
    ownershipHint = 'Created by you · Only visible to you';
  }
  let deleteDescription = `${institution.name} has no accounts.`;
  if (accounts.length > 0)
    deleteDescription =
      'Move the associated accounts to another institution first.';
  let deleteLabel = 'Delete institution';
  let deleteBackground = colors.status.error;
  let deleteTextColor = colors.text.inverse;
  if (!canDelete || deleteInstitutionMutation.isPending) {
    deleteBackground = colors.surface.background.disabled;
    deleteTextColor = colors.text.disabled;
  }
  if (deleteInstitutionMutation.isPending) deleteLabel = 'Deleting…';
  return (
    <AppScreen
      headerTitle={institution.name}
      safeAreaEdges={['left', 'right', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching || accountsQuery.isRefetching}
            onRefresh={() => {
              void query.refetch();
              void accountsQuery.refetch();
            }}
            tintColor={colors.accent.primary}
          />
        }
      >
        {query.isError && (
          <InstitutionState
            title="Couldn’t refresh institution"
            body="Showing the last loaded details."
            action="Try again"
            onAction={() => void query.refetch()}
          />
        )}
        <InstitutionCard>
          <View style={[institutionStyles.row, { gap: spacing.md }]}>
            <InstitutionLogo
              name={institution.name}
              imageUrl={institution.image_src}
            />
            <View style={[institutionStyles.copy, { gap: spacing.xs }]}>
              <InstitutionText heading>{institution.name}</InstitutionText>
              <InstitutionText secondary>
                {countriesLabel(institution.countries)}
              </InstitutionText>
            </View>
          </View>
          <InstitutionText secondary>{ownership}</InstitutionText>
          <InstitutionText secondary>{ownershipHint}</InstitutionText>
        </InstitutionCard>
        <InstitutionText heading>
          Accounts using this institution
        </InstitutionText>
        {accountsQuery.isLoading && (
          <InstitutionState title="Loading accounts…" loading />
        )}
        {accountsQuery.isError && (
          <InstitutionState
            title="Couldn’t load accounts"
            body="Deletion is unavailable until accounts can be checked."
            action="Try again"
            onAction={() => void accountsQuery.refetch()}
          />
        )}
        {!accountsQuery.isLoading &&
          !accountsQuery.isError &&
          accounts.length === 0 && (
            <InstitutionState
              title="No accounts"
              body="This institution isn’t used by any of your accounts."
            />
          )}
        {accounts.map((account) => (
          <Pressable
            key={account.id}
            accessibilityRole="button"
            accessibilityLabel={`Open ${account.name}`}
            onPress={() => router.push(`/accounts/${account.id}`)}
          >
            <InstitutionCard>
              <View style={[institutionStyles.row, { gap: spacing.md }]}>
                <BuildingBankIcon
                  size={24}
                  color={colors.accent.primary}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
                <View style={institutionStyles.copy}>
                  <InstitutionText>{account.name}</InstitutionText>
                  <InstitutionText secondary>
                    {getAccountTypeLabel(account.type)} · {account.currency}
                  </InstitutionText>
                </View>
                <ChevronRightIcon
                  size={24}
                  color={colors.text.secondary}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              </View>
            </InstitutionCard>
          </Pressable>
        ))}
        {custom && (
          <View style={{ gap: spacing.md }}>
            <InstitutionButton
              onClick={() => router.push(`/institutions/${id}/edit`)}
            >
              Edit institution
            </InstitutionButton>
            <InstitutionButton
              variant="subtle"
              disabled={!canDelete || deleteInstitutionMutation.isPending}
              accessibilityHint="Only institutions without accounts can be deleted"
              onClick={() => {
                setDeleteError(null);
                setShowDelete(true);
              }}
            >
              Delete institution
            </InstitutionButton>
            {accounts.length > 0 && (
              <InstitutionText secondary>
                Move these accounts to another institution before deleting this
                one.
              </InstitutionText>
            )}
          </View>
        )}
        {!custom && (
          <InstitutionCard>
            <InstitutionText heading>Managed by Guallet</InstitutionText>
            <InstitutionText secondary>
              Shared institution details cannot be edited or deleted.
            </InstitutionText>
          </InstitutionCard>
        )}
      </ScrollView>
      <BottomSheet
        isOpen={showDelete}
        title="Delete institution?"
        showCloseIcon
        onClose={() => setShowDelete(false)}
      >
        <View style={{ gap: spacing.md }}>
          <InstitutionText>{deleteDescription}</InstitutionText>
          <InstitutionText secondary>
            This action cannot be undone.
          </InstitutionText>
          {deleteError && (
            <InstitutionText error>{deleteError}</InstitutionText>
          )}
          <InstitutionButton
            disabled={!canDelete || deleteInstitutionMutation.isPending}
            onClick={() => void remove()}
            style={{ backgroundColor: deleteBackground }}
          >
            <Text
              style={{
                color: deleteTextColor,
                fontSize: typography.sizes.md,
                fontWeight: '600',
              }}
            >
              {deleteLabel}
            </Text>
          </InstitutionButton>
          <InstitutionButton
            variant="outline"
            disabled={deleteInstitutionMutation.isPending}
            onClick={() => setShowDelete(false)}
          >
            Cancel
          </InstitutionButton>
        </View>
      </BottomSheet>
    </AppScreen>
  );
}
