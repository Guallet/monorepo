import { Box, Flex } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { GualletLogo } from '@/components/GualletLogo/GualletLogo';
import { useTheme } from '@guallet/ui-react';
import { useTranslation } from 'react-i18next';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const isMobile = useMediaQuery('(max-width: 700px)');

  return (
    <Flex
      style={{ minHeight: '100vh' }}
      direction={isMobile ? 'column' : 'row'}
      bg="var(--mantine-color-gray-0)"
    >
      {isMobile ? (
        // Compact top strip on mobile — centered white logo for contrast
        <Flex
          px={spacing.lg}
          py={spacing.md}
          align="center"
          justify="center"
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.darkAccent} 100%)`,
            flexShrink: 0,
          }}
        >
          <img
            src="/guallet-logo-white.png"
            alt="Guallet"
            style={{ height: spacing.xl, display: 'block' }}
          />
        </Flex>
      ) : (
        // Full brand panel on desktop
        <Box
          style={{
            width: 440,
            flexShrink: 0,
            background: `linear-gradient(160deg, ${colors.primary} 0%, ${colors.darkAccent} 100%)`,
            display: 'flex',
            flexDirection: 'column',
            padding: `${spacing.xxl}px ${spacing.xl}px`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <Box
            style={{
              position: 'absolute',
              width: 380,
              height: 380,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              top: -100,
              right: -120,
              pointerEvents: 'none',
            }}
          />
          <Box
            style={{
              position: 'absolute',
              width: 260,
              height: 260,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              bottom: spacing.lg,
              left: -80,
              pointerEvents: 'none',
            }}
          />

          <GualletLogo size={spacing.xl} />

          <Box
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              paddingBottom: spacing.xxl,
            }}
          >
            <Box
              component="h2"
              style={{
                margin: `0 0 ${spacing.md}px`,
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: 'white',
                lineHeight: 1.15,
              }}
            >
              {t('auth.layout.headline.line1', 'Your finances,')}
              <br />
              {t('auth.layout.headline.line2', 'under control.')}
            </Box>
            <Box
              component="p"
              style={{
                margin: `0 0 ${spacing.xl}px`,
                fontSize: 15,
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.65,
                maxWidth: 300,
              }}
            >
              {t(
                'auth.layout.description',
                'Track every account, card and saving goal in one place — without giving anyone access to your money.',
              )}
            </Box>

            {[
              t('auth.layout.feature1', 'Open Banking sync — read-only'),
              t('auth.layout.feature2', 'Multi-currency, multi-account'),
              t('auth.layout.feature3', 'Self-host or secure cloud'),
            ].map((feature) => (
              <Flex key={feature} align="center" gap={spacing.sm} mb={spacing.sm}>
                <Box
                  style={{
                    width: spacing.md,
                    height: spacing.md,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: 'rgba(255,255,255,0.18)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M1.5 5l2.5 2.5 5-5"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Box>
                <Box
                  component="span"
                  style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}
                >
                  {feature}
                </Box>
              </Flex>
            ))}
          </Box>

          <Box
            style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.03em' }}
          >
            {t('auth.layout.license', 'Open source · Apache 2.0')}
          </Box>
        </Box>
      )}

      {/* Form area */}
      <Flex
        flex={1}
        align={isMobile ? 'flex-start' : 'center'}
        justify="center"
        p={
          isMobile
            ? `${spacing.xl}px ${spacing.md}px ${spacing.xxl}px`
            : `${spacing.xxl}px ${spacing.xl}px`
        }
        style={{ overflowY: 'auto' }}
      >
        <Box style={{ width: '100%', maxWidth: 420 }}>{children}</Box>
      </Flex>
    </Flex>
  );
}
