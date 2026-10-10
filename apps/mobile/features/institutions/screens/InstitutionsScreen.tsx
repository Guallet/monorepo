import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAccounts, useInstitutions } from '@guallet/api-react';
import type { InstitutionDto } from '@guallet/api-client';
import { TextInput, useTheme } from '@guallet/luna-mobile';
import { ChevronRightIcon } from '@guallet/luna-mobile/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { countriesLabel, filterInstitutions } from '../institutions';
import {
  InstitutionCard,
  InstitutionLogo,
  InstitutionState,
  InstitutionButton,
  InstitutionText,
  institutionStyles,
} from '../components/InstitutionUi';

export default function InstitutionsScreen() {
  const { colors, spacing, borderRadius } = useTheme();
  const router = useRouter();
  const query = useInstitutions();
  const accountsQuery = useAccounts();
  const [search, setSearch] = useState('');
  const [directory, setDirectory] = useState(false);
  const institutions = useMemo(
    () => filterInstitutions(query.institutions, search, directory),
    [query.institutions, search, directory],
  );
  const counts = useMemo(() => {
    const result = new Map<string, number>();
    for (const account of accountsQuery.accounts)
      result.set(
        account.institutionId,
        (result.get(account.institutionId) ?? 0) + 1,
      );
    return result;
  }, [accountsQuery.accounts]);
  function refresh() {
    void query.refetch();
    void accountsQuery.refetch();
  }
  let heading = 'Your custom institutions';
  if (directory) heading = 'Shared institution directory';
  function empty() {
    if (query.isLoading)
      return <InstitutionState title="Loading institutions…" loading />;
    if (query.isError && !query.data)
      return (
        <InstitutionState
          title="Couldn’t load institutions"
          body="Check your connection and try again."
          action="Try again"
          onAction={() => void query.refetch()}
        />
      );
    if (search.trim())
      return (
        <InstitutionState
          title="No matching institutions"
          body="Try another name or country."
          action="Clear search"
          onAction={() => setSearch('')}
        />
      );
    if (directory)
      return (
        <InstitutionState
          title="No shared institutions available"
          body="Create your own institution to get started."
        />
      );
    return (
      <InstitutionState
        title="No custom institutions yet"
        body="Add a provider you can’t find in the directory, or create a personal wallet."
        action="Browse directory"
        onAction={() => setDirectory(true)}
      />
    );
  }
  function renderInstitution({ item }: { item: InstitutionDto }) {
    let countLabel = 'Accounts unavailable';
    if (accountsQuery.isLoading) countLabel = 'Loading accounts…';
    if (accountsQuery.data && !accountsQuery.isError) {
      const count = counts.get(item.id) ?? 0;
      countLabel = `${count} accounts`;
      if (count === 0) countLabel = 'No accounts';
      if (count === 1) countLabel = 'One account';
      if (count >= 2 && count <= 10) {
        const words = [
          'Two',
          'Three',
          'Four',
          'Five',
          'Six',
          'Seven',
          'Eight',
          'Nine',
          'Ten',
        ];
        countLabel = `${words[count - 2]} accounts`;
      }
    }
    let badge = 'Custom';
    if (item.user_id === null) badge = 'Shared';
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${badge}, ${countriesLabel(item.countries)}, ${countLabel}`}
        onPress={() => router.push(`/institutions/${item.id}`)}
      >
        <InstitutionCard>
          <View style={[institutionStyles.row, { gap: spacing.md }]}>
            <InstitutionLogo name={item.name} imageUrl={item.image_src} />
            <View style={[institutionStyles.copy, { gap: spacing.xs }]}>
              <InstitutionText>{item.name}</InstitutionText>
              <InstitutionText secondary>
                {countriesLabel(item.countries)} · {countLabel}
              </InstitutionText>
              <InstitutionText secondary>{badge}</InstitutionText>
            </View>
            <ChevronRightIcon
              color={colors.text.secondary}
              size={24}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </View>
        </InstitutionCard>
      </Pressable>
    );
  }
  return (
    <AppScreen
      headerTitle="Institutions"
      safeAreaEdges={['left', 'right', 'bottom']}
    >
      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <InstitutionText secondary>
          Organise where you keep your money
        </InstitutionText>
        <TextInput
          accessibilityLabel="Search institutions by name or country"
          placeholder="Search institutions"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          returnKeyType="search"
        />
        <View
          accessibilityRole="tablist"
          style={[
            styles.tabs,
            {
              backgroundColor: colors.surface.background.secondary,
              borderRadius: borderRadius.md,
              padding: spacing.xs,
            },
          ]}
        >
          <InstitutionButton
            variant="subtle"
            style={styles.tab}
            selected={!directory}
            onClick={() => setDirectory(false)}
          >
            Yours
          </InstitutionButton>
          <InstitutionButton
            variant="subtle"
            style={styles.tab}
            selected={directory}
            onClick={() => setDirectory(true)}
          >
            Directory
          </InstitutionButton>
        </View>
        <InstitutionText heading>{heading}</InstitutionText>
      </View>
      <FlatList
        data={institutions}
        keyExtractor={(item) => item.id}
        renderItem={renderInstitution}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[
          institutionStyles.content,
          { padding: spacing.md, gap: spacing.md },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching || accountsQuery.isRefetching}
            onRefresh={refresh}
            tintColor={colors.accent.primary}
          />
        }
        ListEmptyComponent={empty}
        ListHeaderComponent={
          <>
            {query.isError && query.data && (
              <InstitutionState
                title="Couldn’t refresh institutions"
                body="Showing the last loaded institutions."
                action="Try again"
                onAction={() => void query.refetch()}
              />
            )}
            {accountsQuery.isError && (
              <InstitutionState
                title="Account counts unavailable"
                action="Try again"
                onAction={() => void accountsQuery.refetch()}
              />
            )}
          </>
        }
      />
      <View style={{ padding: spacing.md }}>
        <InstitutionButton onClick={() => router.push('/institutions/new')}>
          Create institution
        </InstitutionButton>
      </View>
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  tabs: { flexDirection: 'row' },
  tab: { flex: 1 },
});
