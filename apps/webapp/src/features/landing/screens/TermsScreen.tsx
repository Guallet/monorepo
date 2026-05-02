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

export function TermsScreen() {
  const { t } = useTranslation();

  return (
    <Box
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <LandingHeader />

      <Box py={64} style={{ flex: 1 }}>
        <Container size="md">
          <Stack gap="xl">
            <Stack gap="xs">
              <Title order={1}>
                {t('terms.title', 'Terms and Conditions')}
              </Title>
              <Text c="dimmed" size="sm">
                {t('terms.lastUpdated', 'Last updated: April 2025')}
              </Text>
            </Stack>

            <Divider />

            <Text>
              {t(
                'terms.intro',
                'Please read these Terms and Conditions carefully before using Guallet. By accessing or using the service you agree to be bound by these terms.',
              )}
            </Text>

            {/* Section 1 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('terms.section1.title', '1. Acceptance of Terms')}
              </Title>
              <Text>
                {t(
                  'terms.section1.body',
                  'By creating an account or using Guallet you confirm that you are at least 18 years of age and have the legal capacity to enter into these terms. If you do not agree, please do not use the service.',
                )}
              </Text>
            </Stack>

            {/* Section 2 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('terms.section2.title', '2. Open Source Licence')}
              </Title>
              <Text>
                {t(
                  'terms.section2.body',
                  'Guallet is released as open source software under the Apache 2.0 Licence. You may inspect, fork, and contribute to the source code on GitHub.',
                )}
              </Text>
              <Anchor
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('terms.section2.githubLink', 'View source on GitHub')}
              </Anchor>
            </Stack>

            {/* Section 3 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('terms.section3.title', '3. Your Account')}
              </Title>
              <Text>
                {t(
                  'terms.section3.body',
                  'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorised use.',
                )}
              </Text>
            </Stack>

            {/* Section 4 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('terms.section4.title', '4. Acceptable Use')}
              </Title>
              <Text>{t('terms.section4.intro', 'You agree not to:')}</Text>
              <List spacing="xs">
                <List.Item>
                  {t(
                    'terms.section4.item1',
                    'Use the service for any unlawful purpose',
                  )}
                </List.Item>
                <List.Item>
                  {t(
                    'terms.section4.item2',
                    'Attempt to gain unauthorised access to any part of the service',
                  )}
                </List.Item>
                <List.Item>
                  {t(
                    'terms.section4.item3',
                    'Transmit any harmful or malicious code',
                  )}
                </List.Item>
                <List.Item>
                  {t(
                    'terms.section4.item4',
                    'Violate any applicable laws or regulations',
                  )}
                </List.Item>
              </List>
            </Stack>

            {/* Section 5 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('terms.section5.title', '5. Data and Privacy')}
              </Title>
              <Text>
                {t(
                  'terms.section5.body',
                  'Your use of the service is also governed by our Privacy Policy, which is incorporated into these Terms by reference.',
                )}
              </Text>
            </Stack>

            {/* Section 6 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('terms.section6.title', '6. Disclaimer of Warranties')}
              </Title>
              <Text>
                {t(
                  'terms.section6.body',
                  'Guallet is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or availability of the service at any given time.',
                )}
              </Text>
            </Stack>

            {/* Section 7 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('terms.section7.title', '7. Limitation of Liability')}
              </Title>
              <Text>
                {t(
                  'terms.section7.body',
                  'To the maximum extent permitted by law, Guallet and its contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.',
                )}
              </Text>
            </Stack>

            {/* Section 8 */}
            <Stack gap="sm">
              <Title order={3}>
                {t('terms.section8.title', '8. Changes to Terms')}
              </Title>
              <Text>
                {t(
                  'terms.section8.body',
                  'We may update these Terms from time to time. Continued use of the service after changes become effective constitutes acceptance of the revised Terms.',
                )}
              </Text>
            </Stack>

            {/* Section 9 */}
            <Stack gap="sm">
              <Title order={3}>{t('terms.section9.title', '9. Contact')}</Title>
              <Text>
                {t(
                  'terms.section9.body',
                  'If you have any questions about these Terms please open an issue on our GitHub repository.',
                )}
              </Text>
              <Anchor
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('terms.section9.githubLink', 'Open an issue on GitHub')}
              </Anchor>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <LandingFooter />
    </Box>
  );
}
