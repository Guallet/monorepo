import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, useTheme } from '@guallet/luna-mobile';
import { Text, View } from 'react-native';
import { ApiError } from '@guallet/api-client';
import { AppScreen } from '@/components/layout/AppScreen';
import { AccountForm } from '@/features/accounts/components/AccountForm';
import { useAccount } from '@guallet/api-react';

export default function EditAccountScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(rawId) ? (rawId[0] ?? '') : (rawId ?? '');
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { account, error, isError, isLoading, refetch } = useAccount(id);

  if (
    !isLoading &&
    isError &&
    !(error instanceof ApiError && error.status === 404)
  ) {
    return (
      <AppScreen headerTitle="Edit account">
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            gap: 12,
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              fontWeight: '700',
            }}
          >
            Couldn’t load account
          </Text>
          <Text style={{ color: colors.text.secondary }}>
            Check your connection and try again.
          </Text>
          <Button onClick={() => void refetch()} variant="outline">
            Try again
          </Button>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      headerTitle="Edit account"
      isLoading={isLoading}
      loadingMessage="Loading account…"
    >
      {!isLoading && !account ? (
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            gap: 12,
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              fontWeight: '700',
            }}
          >
            Account not found
          </Text>
          <Button onClick={() => router.back()} variant="outline">
            Go back
          </Button>
        </View>
      ) : (
        <AccountForm
          account={account}
          onCancel={() => router.back()}
          onSaved={(savedAccount) =>
            router.replace(`/accounts/${savedAccount.id}`)
          }
        />
      )}
    </AppScreen>
  );
}
