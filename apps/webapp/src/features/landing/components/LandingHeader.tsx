import {
  Anchor,
  Box,
  Button,
  Container,
  Group,
  Title,
} from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@guallet/auth';
import { GualletLogo } from '@/components/GualletLogo/GualletLogo';

export function LandingHeader() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Box
      component="header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid var(--mantine-color-default-border)',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(var(--mantine-color-body-rgb, 255,255,255), 0.85)',
      }}
    >
      <Container size="xl">
        <Group h={64} justify="space-between">
          {/* Logo */}
          <Anchor
            component="button"
            underline="never"
            onClick={() => navigate({ to: '/' })}
          >
            <Group gap="xs">
              <GualletLogo size={36} />
              <Title order={3} style={{ letterSpacing: '-0.5px' }}>
                Guallet
              </Title>
            </Group>
          </Anchor>

          {/* Auth buttons */}
          <Group gap="sm">
            {isAuthenticated ? (
              <Button onClick={() => navigate({ to: '/dashboard' })}>
                {t('landing.header.goToDashboard', 'Go to Dashboard')}
              </Button>
            ) : (
              <>
                <Button
                  variant="subtle"
                  onClick={() =>
                    navigate({ to: '/login', search: { redirect: '/dashboard' } })
                  }
                >
                  {t('landing.header.login', 'Log in')}
                </Button>
                <Button
                  onClick={() => navigate({ to: '/register' })}
                >
                  {t('landing.header.createAccount', 'Create account')}
                </Button>
              </>
            )}
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
