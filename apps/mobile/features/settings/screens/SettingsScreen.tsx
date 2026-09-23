import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@guallet/auth';
import { useUser } from '@guallet/api-react';
import { Button, useTheme } from '@guallet/luna-mobile';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SettingsRow } from '../components/SettingsRow';
import { SettingsSection } from '../components/SettingsSection';

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return initials || '?';
}

export default function SettingsScreen() {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const { logout } = useAuth();
  const { user, isLoading, isError, isRefetching, refetch } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [failedProfileImage, setFailedProfileImage] = useState<string | null>(
    null,
  );

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);

    try {
      const result = await logout();

      if (!result.success) {
        Alert.alert(
          'Couldn’t sign out',
          result.error?.message ?? 'Please try again in a moment.',
        );
      }
    } catch {
      Alert.alert('Couldn’t sign out', 'Please try again in a moment.');
    } finally {
      setIsSigningOut(false);
    }
  }, [logout]);

  const confirmSignOut = useCallback(() => {
    Alert.alert('Sign out?', 'You can sign back in at any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void handleSignOut();
        },
      },
    ]);
  }, [handleSignOut]);

  const profileName = user?.name?.trim() || 'Your profile';
  const profileEmail = user?.email?.trim() || 'Profile details unavailable';
  const profileImage = user?.profile_src?.trim();
  const showProfileImage =
    Boolean(profileImage) && failedProfileImage !== profileImage;
  const showLoading = isLoading && !user;
  const showError = !showLoading && isError && !user;
  const showProfile = !showLoading && !showError;

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safeArea,
        { backgroundColor: colors.surface.background.page },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { gap: spacing.lg, padding: spacing.md },
        ]}
        refreshControl={
          <RefreshControl
            onRefresh={() => void refetch()}
            refreshing={isRefetching}
            tintColor={colors.accent.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: colors.text.primary, fontSize: typography.sizes.xxl },
            ]}
          >
            Settings
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: colors.text.secondary, fontSize: typography.sizes.sm },
            ]}
          >
            Manage your account and session
          </Text>
        </View>

        {showLoading && (
          <View
            style={[
              styles.profileStatusCard,
              styles.profileLoadingCard,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
              },
            ]}
          >
            <ActivityIndicator color={colors.accent.primary} />
            <Text
              style={[
                styles.loadingText,
                {
                  color: colors.text.secondary,
                  fontSize: typography.sizes.sm,
                  marginTop: spacing.sm,
                },
              ]}
            >
              Loading your profile…
            </Text>
          </View>
        )}
        {showError && (
          <View
            style={[
              styles.profileStatusCard,
              styles.profileErrorCard,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
              },
            ]}
          >
            <Text
              style={[
                styles.profileErrorTitle,
                { color: colors.text.primary, fontSize: typography.sizes.lg },
              ]}
            >
              Couldn’t load your profile
            </Text>
            <Text
              style={[
                styles.profileErrorBody,
                {
                  color: colors.text.secondary,
                  fontSize: typography.sizes.sm,
                  marginTop: spacing.xs,
                },
              ]}
            >
              Check your connection and try again.
            </Text>
            <Button
              onClick={() => void refetch()}
              variant="outline"
              style={{ marginTop: spacing.md }}
            >
              Try again
            </Button>
          </View>
        )}
        {showProfile && (
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
              },
            ]}
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: colors.button.secondary.default,
                  borderRadius: borderRadius.xl,
                },
              ]}
            >
              {showProfileImage && (
                <Image
                  accessibilityLabel={`${profileName} profile picture`}
                  onError={() => setFailedProfileImage(profileImage ?? null)}
                  source={{ uri: profileImage }}
                  style={[
                    styles.avatarImage,
                    { borderRadius: borderRadius.xl },
                  ]}
                />
              )}
              {!showProfileImage && (
                <Text
                  style={[
                    styles.avatarInitials,
                    {
                      color: colors.accent.dark,
                      fontSize: typography.sizes.lg,
                    },
                  ]}
                >
                  {getInitials(profileName)}
                </Text>
              )}
            </View>
            <View style={[styles.profileCopy, { marginLeft: spacing.md }]}>
              <Text
                style={[
                  styles.profileName,
                  { color: colors.text.primary, fontSize: typography.sizes.lg },
                ]}
                numberOfLines={1}
              >
                {profileName}
              </Text>
              <Text
                style={[
                  styles.profileEmail,
                  {
                    color: colors.text.secondary,
                    fontSize: typography.sizes.sm,
                  },
                ]}
                numberOfLines={1}
              >
                {profileEmail}
              </Text>
            </View>
          </View>
        )}

        <SettingsSection title="Session">
          <SettingsRow
            destructive
            disabled={isSigningOut}
            icon={
              <IconSymbol
                name="rectangle.portrait.and.arrow.right"
                size={22}
                color={colors.status.error}
              />
            }
            isLoading={isSigningOut}
            label="Sign out"
            onPress={confirmSignOut}
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    gap: 2,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    fontWeight: '400',
  },
  profileCard: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
  },
  profileStatusCard: {
    borderWidth: 1,
    flexDirection: 'column',
  },
  profileLoadingCard: {
    alignItems: 'center',
  },
  profileErrorCard: {
    alignItems: 'stretch',
  },
  avatar: {
    alignItems: 'center',
    height: 64,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 64,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarInitials: {
    fontWeight: '700',
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontWeight: '700',
  },
  profileEmail: {
    marginTop: 2,
  },
  loadingText: {
    textAlign: 'center',
  },
  profileErrorTitle: {
    fontWeight: '700',
  },
  profileErrorBody: {
    lineHeight: 20,
  },
});
