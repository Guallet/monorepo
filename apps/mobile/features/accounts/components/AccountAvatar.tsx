import { StyleSheet, Text, View } from 'react-native';
import { AccountDto } from '@guallet/api-client';
import { useTheme } from '@guallet/luna-mobile';
import { getAccountHue, getAccountInitials } from '../models/account';

export function AccountAvatar({
  account,
  size = 48,
}: Readonly<{ account: Pick<AccountDto, 'name'>; size?: number }>) {
  const { colors } = useTheme();
  const hue = getAccountHue(account.name);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: `hsl(${hue}, 55%, 92%)`,
          borderColor: `hsl(${hue}, 45%, 70%)`,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          { color: `hsl(${hue}, 45%, 32%)`, fontSize: size * 0.3 },
        ]}
      >
        {getAccountInitials(account.name)}
      </Text>
      <View style={[styles.dot, { backgroundColor: colors.accent.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  initials: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  dot: {
    borderColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 2,
    bottom: -1,
    height: 10,
    position: 'absolute',
    right: -1,
    width: 10,
  },
});
