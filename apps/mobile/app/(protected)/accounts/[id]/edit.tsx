import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, useTheme } from '@guallet/luna-mobile';
import { Text, View } from 'react-native';
import { ApiError } from '@guallet/api-client';
import { AppScreen } from '@/components/layout/AppScreen';
import { AccountForm } from '@/features/accounts/components/AccountForm';
import { useAccount } from '@guallet/api-react';
import { isManualAccount } from '@/features/accounts/models/accountFlow';
import { useTranslation } from 'react-i18next';

export default function EditAccountScreen() {
  const { t } = useTranslation();
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
      <AppScreen headerTitle={t('copy_1o8ro3q')}>
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
            {t('copy_14kn65g')}
          </Text>
          <Text style={{ color: colors.text.secondary }}>
            {t('copy_k8irws')}
          </Text>
          <Button onClick={() => void refetch()} variant="outline">
            {t('copy_982hh6')}
          </Button>
        </View>
      </AppScreen>
    );
  }

  if (account && !isManualAccount(account)) {
    return (
      <AppScreen headerTitle={t('copy_1o8ro3q')}>
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
            }}
          >
            {t('copy_1s85fps')}
          </Text>
          <Button onClick={() => router.back()} variant="outline">
            {t('copy_rcg61q')}
          </Button>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      headerTitle={t('copy_1o8ro3q')}
      isLoading={isLoading}
      loadingMessage={t('copy_gyilum')}
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
            {t('copy_kyuo8x')}
          </Text>
          <Button onClick={() => router.back()} variant="outline">
            {t('copy_rcg61q')}
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
