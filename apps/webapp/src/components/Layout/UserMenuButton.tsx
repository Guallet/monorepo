import { Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconLogout, IconSettings } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useUser } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserMenuButton() {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const navigate = useNavigate();
  const { user } = useUser();

  const name = user?.name ?? '';
  const email = user?.email ?? '';
  const avatarSrc = user?.profile_src ?? undefined;
  const initials = name ? getInitials(name) : undefined;
  const firstName = name.trim().split(/\s+/)[0] ?? name;

  return (
    <Menu
      position="bottom-end"
      offset={spacing.sm}
      withArrow={false}
      shadow="md"
      openDelay={0}
      closeDelay={100}
      radius="md"
      width={224}
    >
      <Menu.Target>
        <UnstyledButton
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            padding: `${spacing.xs}px ${spacing.sm}px ${spacing.xs}px ${spacing.xs}px`,
            borderRadius: 999,
            border: '1px solid transparent',
            transition: 'background 150ms, border-color 150ms',
          }}
          styles={{
            root: {
              '&:hover, &[data-expanded]': {
                background: colors.surface,
                borderColor: colors.paleGrey,
              },
            },
          }}
        >
          <Avatar src={avatarSrc} radius="xl" size={32}>
            {initials}
          </Avatar>
          <Text
            size="sm"
            fw={600}
            visibleFrom="sm"
            style={{ whiteSpace: 'nowrap' }}
          >
            {firstName}
          </Text>
          <IconChevronDown size={12} color={colors.midGrey} />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        {/* User info header */}
        <Group
          gap={spacing.sm}
          px={spacing.sm}
          pt={spacing.sm}
          pb={spacing.sm}
          wrap="nowrap"
        >
          <Avatar src={avatarSrc} radius="xl" size={38}>
            {initials}
          </Avatar>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Text size="sm" fw={700} truncate>
              {name}
            </Text>
            {email && (
              <Text size="xs" c="dimmed" truncate>
                {email}
              </Text>
            )}
          </div>
        </Group>

        <Menu.Divider />

        <Menu.Item
          leftSection={<IconSettings size={16} />}
          onClick={() => navigate({ to: '/settings' })}
        >
          {t('layout.userMenu.settings', 'Settings')}
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          color="red"
          leftSection={<IconLogout size={16} />}
          onClick={() => navigate({ to: '/logout' })}
        >
          {t('layout.userMenu.logout', 'Log out')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
