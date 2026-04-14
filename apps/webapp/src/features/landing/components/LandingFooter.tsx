import { Anchor, Box, Container, Divider, Group, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { GualletLogo } from '@/components/GualletLogo/GualletLogo';

export function LandingFooter() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box component="footer" py="xl" mt="xl">
      <Divider mb="xl" />
      <Container size="xl">
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Group gap="xs">
            <GualletLogo size={28} />
            <Text size="sm" fw={600}>
              Guallet
            </Text>
          </Group>

          <Group gap="lg">
            <Anchor
              component="button"
              size="sm"
              c="dimmed"
              onClick={() => navigate({ to: '/terms' })}
            >
              {t('landing.footer.terms', 'Terms & Conditions')}
            </Anchor>
            <Anchor
              component="button"
              size="sm"
              c="dimmed"
              onClick={() => navigate({ to: '/privacy' })}
            >
              {t('landing.footer.privacy', 'Privacy Policy')}
            </Anchor>
            <Anchor
              href="https://github.com/Guallet/monorepo"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              c="dimmed"
            >
              {t('landing.footer.github', 'GitHub')}
            </Anchor>
          </Group>

          <Text size="xs" c="dimmed">
            {t('landing.footer.copyright', '© {{year}} Guallet. Open source.', {
              year: new Date().getFullYear(),
            })}
          </Text>
        </Group>
      </Container>
    </Box>
  );
}
