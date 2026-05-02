import {
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconBrandGithub,
  IconChartBar,
  IconCoin,
  IconCreditCard,
  IconFileText,
  IconLock,
  IconRefresh,
  IconShieldCheck,
  IconTarget,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@guallet/auth';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { LandingHeader } from '../components/LandingHeader';
import { LandingFooter } from '../components/LandingFooter';

const GITHUB_URL = 'https://github.com/Guallet/monorepo';

const animationStyle = (isVisible: boolean, delay = 0) => ({
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
  transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
});

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div ref={ref}>
      <Card
        withBorder
        radius="md"
        p="lg"
        h="100%"
        style={animationStyle(isVisible, delay)}
      >
        <ThemeIcon size={48} radius="md" mb="md" variant="light">
          {icon}
        </ThemeIcon>
        <Text fw={600} mb="xs">
          {title}
        </Text>
        <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
          {description}
        </Text>
      </Card>
    </div>
  );
}

export function LandingScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { ref: heroRef, isVisible: heroIsVisible } = useScrollAnimation(0);
  const { ref: featuresRef, isVisible: featuresIsVisible } =
    useScrollAnimation();
  const { ref: openSourceRef, isVisible: openSourceIsVisible } =
    useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaIsVisible } = useScrollAnimation();

  const features = [
    {
      icon: <IconCoin size={24} />,
      title: t('landing.features.accounts.title', 'Account Management'),
      description: t(
        'landing.features.accounts.description',
        'Track all your bank accounts, credit cards, and savings in one place.',
      ),
    },
    {
      icon: <IconCreditCard size={24} />,
      title: t('landing.features.transactions.title', 'Transactions'),
      description: t(
        'landing.features.transactions.description',
        'Log and categorise every transaction automatically. Import from CSV or connect your bank.',
      ),
    },
    {
      icon: <IconChartBar size={24} />,
      title: t('landing.features.reports.title', 'Reports & Insights'),
      description: t(
        'landing.features.reports.description',
        'Visualise your spending patterns and cash flow with beautiful charts.',
      ),
    },
    {
      icon: <IconTarget size={24} />,
      title: t('landing.features.budgets.title', 'Budgets'),
      description: t(
        'landing.features.budgets.description',
        'Set budgets for each category and get alerts when you are close to your limits.',
      ),
    },
    {
      icon: <IconRefresh size={24} />,
      title: t('landing.features.subscriptions.title', 'Subscriptions'),
      description: t(
        'landing.features.subscriptions.description',
        'Never miss a recurring payment. Track all your subscriptions in one place.',
      ),
    },
    {
      icon: <IconFileText size={24} />,
      title: t('landing.features.savingGoals.title', 'Saving Goals'),
      description: t(
        'landing.features.savingGoals.description',
        'Set and track savings goals — from an emergency fund to your next holiday.',
      ),
    },
    {
      icon: <IconLock size={24} />,
      title: t('landing.features.privacy.title', 'Privacy First'),
      description: t(
        'landing.features.privacy.description',
        'Your financial data stays yours. Self-host Guallet or use our secure cloud.',
      ),
    },
    {
      icon: <IconShieldCheck size={24} />,
      title: t('landing.features.openBanking.title', 'Open Banking'),
      description: t(
        'landing.features.openBanking.description',
        'Connect to thousands of banks and institutions via open banking APIs.',
      ),
    },
  ];

  return (
    <Box
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <LandingHeader />

      <Box style={{ flex: 1 }}>
        {/* ─── Hero ─────────────────────────────────────────── */}
        <Box
          ref={heroRef}
          style={{
            background:
              'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-violet-6) 100%)',
            paddingTop: 96,
            paddingBottom: 96,
          }}
        >
          <Container size="md">
            <Stack
              align="center"
              gap="xl"
              style={animationStyle(heroIsVisible)}
            >
              <Badge
                size="lg"
                variant="white"
                leftSection={<IconBrandGithub size={14} />}
                component="a"
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ cursor: 'pointer' }}
              >
                {t('landing.hero.openSourceBadge', 'Open Source')}
              </Badge>

              <Title
                order={1}
                ta="center"
                c="white"
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  lineHeight: 1.15,
                }}
              >
                {t('landing.hero.title', 'Your finances,\nunder control.')}
              </Title>

              <Text
                size="xl"
                ta="center"
                c="white"
                style={{ opacity: 0.85, maxWidth: 560 }}
              >
                {t(
                  'landing.hero.subtitle',
                  'Guallet is a free, open-source personal finance manager that helps you track spending, set budgets, and reach your financial goals.',
                )}
              </Text>

              <Group gap="md" justify="center">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    variant="white"
                    onClick={() => navigate({ to: '/dashboard' })}
                  >
                    {t('landing.hero.goToDashboard', 'Go to Dashboard')}
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      variant="white"
                      onClick={() => navigate({ to: '/register' })}
                    >
                      {t('landing.hero.getStarted', "Get started — it's free")}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      color="white"
                      onClick={() =>
                        navigate({
                          to: '/login',
                          search: { redirect: '/dashboard' },
                        })
                      }
                    >
                      {t('landing.hero.login', 'Log in')}
                    </Button>
                  </>
                )}
              </Group>
            </Stack>
          </Container>
        </Box>

        {/* ─── Features ─────────────────────────────────────── */}
        <Box py={80}>
          <Container size="xl">
            <div ref={featuresRef}>
              <Stack
                align="center"
                mb={48}
                style={animationStyle(featuresIsVisible)}
              >
                <Badge variant="light" size="lg">
                  {t('landing.features.badge', 'Features')}
                </Badge>
                <Title order={2} ta="center">
                  {t(
                    'landing.features.title',
                    'Everything you need to manage your money',
                  )}
                </Title>
                <Text size="lg" c="dimmed" ta="center" maw={560}>
                  {t(
                    'landing.features.subtitle',
                    'A complete personal finance toolkit — free, open source, and designed for privacy.',
                  )}
                </Text>
              </Stack>
            </div>

            <Grid gutter="md">
              {features.map((feature, index) => (
                <Grid.Col key={feature.title} span={{ base: 12, sm: 6, lg: 3 }}>
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    delay={index * 60}
                  />
                </Grid.Col>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ─── Open Source ──────────────────────────────────── */}
        <Box py={80} style={{ background: 'var(--mantine-color-dark-filled)' }}>
          <Container size="md">
            <div ref={openSourceRef}>
              <Stack
                align="center"
                gap="xl"
                style={animationStyle(openSourceIsVisible)}
              >
                <ThemeIcon size={72} radius="xl" variant="light" color="gray">
                  <IconBrandGithub size={40} />
                </ThemeIcon>

                <Title order={2} ta="center" c="white">
                  {t('landing.openSource.title', 'Open Source & Free Forever')}
                </Title>

                <Text size="lg" ta="center" c="gray.4" maw={560}>
                  {t(
                    'landing.openSource.description',
                    'Guallet is 100% open source under the Apache 2.0 licence. Inspect the code, contribute improvements, or self-host it on your own infrastructure.',
                  )}
                </Text>

                <Anchor
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="never"
                >
                  <Button
                    size="lg"
                    variant="white"
                    leftSection={<IconBrandGithub size={20} />}
                  >
                    {t('landing.openSource.viewOnGithub', 'View on GitHub')}
                  </Button>
                </Anchor>
              </Stack>
            </div>
          </Container>
        </Box>

        {/* ─── Bottom CTA ───────────────────────────────────── */}
        {!isAuthenticated && (
          <Box py={80}>
            <Container size="sm">
              <div ref={ctaRef}>
                <Center>
                  <Stack
                    align="center"
                    gap="lg"
                    style={animationStyle(ctaIsVisible)}
                  >
                    <Title order={2} ta="center">
                      {t(
                        'landing.cta.title',
                        'Ready to take control of your finances?',
                      )}
                    </Title>
                    <Text size="lg" c="dimmed" ta="center">
                      {t(
                        'landing.cta.subtitle',
                        'Join thousands of people who trust Guallet to manage their money.',
                      )}
                    </Text>
                    <Button
                      size="lg"
                      onClick={() => navigate({ to: '/register' })}
                    >
                      {t('landing.cta.button', 'Create your free account')}
                    </Button>
                  </Stack>
                </Center>
              </div>
            </Container>
          </Box>
        )}
      </Box>

      <LandingFooter />
    </Box>
  );
}
