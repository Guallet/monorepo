import { AccountDto } from '@guallet/api-client';
import { useInstitution } from '@guallet/api-react';
import { Avatar, AvatarProps } from '@mantine/core';

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
  account: AccountDto;
}

export function AccountAvatar({
  account,
  ...props
}: Readonly<AccountAvatarProps>) {
  const { institution } = useInstitution(account.institutionId || null);

  if (institution?.image_src) {
    return (
      <Avatar
        src={institution.image_src}
        alt={institution.name}
        size={44}
        radius={14}
        style={{ flexShrink: 0 }}
        {...props}
      />
    );
  }

  const initials = initialsFor(account.name);
  const hue = hueFor(account.name);

  return (
    <Avatar
      size={44}
      radius={14}
      {...props}
      style={{
        background: `oklch(95% 0.03 ${hue})`,
        color: `oklch(38% 0.08 ${hue})`,
        outline: `1.5px dashed oklch(70% 0.06 ${hue})`,
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: '-0.01em',
        flexShrink: 0,
        userSelect: 'none',
        ...props.style,
      }}
    >
      {initials}
    </Avatar>
  );
}
