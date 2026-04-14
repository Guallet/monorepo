import {
  Anchor,
  Box,
  Container,
  Divider,
  List,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { LandingHeader } from '../components/LandingHeader';
import { LandingFooter } from '../components/LandingFooter';

const GITHUB_URL = 'https://github.com/Guallet/monorepo';

export function PrivacyScreen() {
  const { t } = useTranslation();

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LandingHeader />

      <Box py={64} style={{ flex: 1 }}>
        <Container size="md">
          <Stack gap="xl">
            <Stack gap="xs">
              <Title order={1}>
                {t('privacy.title', 'Privacy Policy')}
              </Title>
              <Text c="dimmed" size="sm">
                {t('privacy.lastUpdated', 'Last updated: April 2025')}
              </Text>
            </Stack>

            <Divider />

            <Text>
              {t(
                'privacy.intro',
                'This Privacy Policy describes how Guallet collects, uses, and protects your personal information when you use our service.',
              )}
            </Text>

            {/* Section 1 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('privacy.section1.title', '1. Information We Collect')}
              </Title>
              <Text>
                {t('privacy.section1.intro', 'We collect the following types of information:')}
              </Text>
              <List spacing="xs">
                <List.Item>
                  <Text component="span" fw={600}>
                    {t('privacy.section1.accountData', 'Account data: ')}
                  </Text>
                  {t(
                    'privacy.section1.accountDataDesc',
                    'Name, email address, and password (stored as a secure hash).',
                  )}
                </List.Item>
                <List.Item>
                  <Text component="span" fw={600}>
                    {t('privacy.section1.financialData', 'Financial data: ')}
                  </Text>
                  {t(
                    'privacy.section1.financialDataDesc',
                    'Account balances, transactions, budgets, and other financial records you choose to enter.',
                  )}
                </List.Item>
                <List.Item>
                  <Text component="span" fw={600}>
                    {t('privacy.section1.usageData', 'Usage data: ')}
                  </Text>
                  {t(
                    'privacy.section1.usageDataDesc',
                    'Basic analytics such as page visits and feature usage to help us improve the product.',
                  )}
                </List.Item>
              </List>
            </Stack>

            {/* Section 2 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('privacy.section2.title', '2. How We Use Your Information')}
              </Title>
              <List spacing="xs">
                <List.Item>
                  {t('privacy.section2.item1', 'To provide and maintain the service')}
                </List.Item>
                <List.Item>
                  {t('privacy.section2.item2', 'To authenticate you and keep your account secure')}
                </List.Item>
                <List.Item>
                  {t(
                    'privacy.section2.item3',
                    'To send important notifications about your account',
                  )}
                </List.Item>
                <List.Item>
                  {t(
                    'privacy.section2.item4',
                    'To improve and develop new features based on anonymous usage patterns',
                  )}
                </List.Item>
              </List>
            </Stack>

            {/* Section 3 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('privacy.section3.title', '3. Data Storage and Security')}
              </Title>
              <Text>
                {t(
                  'privacy.section3.body',
                  'Your data is stored in encrypted databases. We implement industry-standard security measures including HTTPS, password hashing, and regular security audits. No system is 100% secure; please also take steps to protect your own account credentials.',
                )}
              </Text>
            </Stack>

            {/* Section 4 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('privacy.section4.title', '4. Data Sharing')}
              </Title>
              <Text>
                {t(
                  'privacy.section4.body',
                  'We do not sell, trade, or rent your personal data to third parties. We may share anonymised, aggregated data for analytical purposes. When you connect your bank via open banking, your data is transmitted directly through the provider\'s secure API — we never store your banking credentials.',
                )}
              </Text>
            </Stack>

            {/* Section 5 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('privacy.section5.title', '5. Cookies')}
              </Title>
              <Text>
                {t(
                  'privacy.section5.body',
                  'We use essential cookies to keep you logged in and to remember your preferences. We do not use advertising or tracking cookies.',
                )}
              </Text>
            </Stack>

            {/* Section 6 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('privacy.section6.title', '6. Your Rights')}
              </Title>
              <Text>
                {t('privacy.section6.intro', 'You have the right to:')}
              </Text>
              <List spacing="xs">
                <List.Item>
                  {t('privacy.section6.item1', 'Access the personal data we hold about you')}
                </List.Item>
                <List.Item>
                  {t(
                    'privacy.section6.item2',
                    'Correct inaccurate data',
                  )}
                </List.Item>
                <List.Item>
                  {t(
                    'privacy.section6.item3',
                    'Request deletion of your account and associated data',
                  )}
                </List.Item>
                <List.Item>
                  {t(
                    'privacy.section6.item4',
                    'Export your data in a machine-readable format',
                  )}
                </List.Item>
              </List>
              <Text>
                {t(
                  'privacy.section6.contact',
                  'To exercise any of these rights, please open an issue on our GitHub repository.',
                )}
              </Text>
            </Stack>

            {/* Section 7 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('privacy.section7.title', '7. Open Source')}
              </Title>
              <Text>
                {t(
                  'privacy.section7.body',
                  'Guallet is open source. You can review exactly how your data is handled by reading the source code on GitHub.',
                )}
              </Text>
              <Anchor href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                {t('privacy.section7.githubLink', 'View source code on GitHub')}
              </Anchor>
            </Stack>

            {/* Section 8 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('privacy.section8.title', '8. Changes to This Policy')}
              </Title>
              <Text>
                {t(
                  'privacy.section8.body',
                  'We may update this Privacy Policy periodically. We will notify you of significant changes by email or through a prominent notice in the application.',
                )}
              </Text>
            </Stack>

            {/* Section 9 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('privacy.section9.title', '9. Contact Us')}
              </Title>
              <Text>
                {t(
                  'privacy.section9.body',
                  'If you have questions or concerns about this Privacy Policy, please contact us by opening an issue on GitHub.',
                )}
              </Text>
              <Anchor href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                {t('privacy.section9.githubLink', 'Open an issue on GitHub')}
              </Anchor>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <LandingFooter />
    </Box>
  );
}
