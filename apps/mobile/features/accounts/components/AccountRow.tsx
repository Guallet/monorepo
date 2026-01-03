import { Balance } from '@/components/Balance';
import { InstitutionLogo } from '@/features/institutions/components/InstitutionLogo';
import { useAccount } from '@guallet/api-react';
import { Group, Label, useTheme, Visibility } from '@luna-ui/react-native';
import { Pressable } from 'react-native';

interface AccountRowProps {
  accountId: string;
  displayBalance?: boolean;
  onClick?: () => void;
}

export function AccountRowSkeleton() {
  const { colors, spacing } = useTheme();

  return (
    <Group>
      <Group
        style={{
          width: 40,
          height: 40,
          borderRadius: spacing.md,
          backgroundColor: colors.surface,
        }}
      />
      <Group style={{ flexGrow: 1, flexShrink: 1, gap: spacing.xs }}>
        <Group
          style={{
            width: '60%',
            height: 16,
            borderRadius: spacing.xs,
            backgroundColor: colors.surface,
          }}
        />
        <Group
          style={{
            width: '40%',
            height: 12,
            borderRadius: spacing.xs,
            backgroundColor: colors.surface,
          }}
        />
      </Group>
    </Group>
  );
}

export function AccountRow({
  accountId,
  displayBalance = false,
  onClick,
}: Readonly<AccountRowProps>) {
  const { colors, spacing } = useTheme();
  const { account } = useAccount(accountId);

  if (!account) {
    return <AccountRowSkeleton />;
  }

  return (
    <Pressable
      onPress={onClick}
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.background : colors.surface,
        padding: spacing.sm,
      })}
    >
      <Group align="center" gap={10}>
        <InstitutionLogo
          institutionId={account.institutionId}
          alt={account.name}
        />
        <Label
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ flexGrow: 1, flexShrink: 1 }}
        >
          {account.name}
        </Label>
        <Visibility isVisible={displayBalance}>
          <Balance balance={account.balance} />
        </Visibility>
      </Group>
    </Pressable>
  );
}
