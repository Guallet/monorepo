import { useAccount, useInstitution } from '@guallet/api-react';
import { Avatar, AvatarProps, Tooltip } from '@mantine/core';

function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function hueFor(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++)
    h = Math.trunc(h * 31 + (str.codePointAt(i) ?? 0));
  return Math.abs(h) % 360;
}

interface AccountAvatarProps extends AvatarProps {
  accountId: string;
  showTooltip?: boolean;
}

export function AccountAvatar({
  accountId,
  showTooltip = false,
  ...props
}: Readonly<AccountAvatarProps>) {
  const { account } = useAccount(accountId);
  const { institution } = useInstitution(account?.institutionId ?? null);

  const avatar = institution?.image_src ? (
    <Avatar src={institution.image_src} alt={institution.name} {...props} />
  ) : (
    <Avatar
      {...props}
      style={{
        background: `oklch(95% 0.03 ${hueFor(account?.name ?? '')})`,
        color: `oklch(38% 0.08 ${hueFor(account?.name ?? '')})`,
        outline: `1.5px dashed oklch(70% 0.06 ${hueFor(account?.name ?? '')})`,
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: '-0.01em',
        userSelect: 'none',
        ...props.style,
      }}
    >
      {account ? initialsFor(account.name) : null}
    </Avatar>
  );

  if (showTooltip && institution?.name) {
    return <Tooltip label={institution.name}>{avatar}</Tooltip>;
  }

  return avatar;
}
