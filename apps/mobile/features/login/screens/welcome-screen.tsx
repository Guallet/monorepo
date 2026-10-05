import { AuthLink, AuthScreen } from '@/features/login/components/AuthLayout';
import { WelcomeIllustration } from '@/features/login/components/WelcomeIllustration';
import { Button, Label, Title, useTheme } from '@guallet/luna-mobile';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

const slides = [
  {
    feature: 'accounts',
    label: 'See the whole picture',
    title: 'Your accounts in one place',
    description:
      'Bring your accounts together for a clearer view of your money, wherever you keep it.',
  },
  {
    feature: 'spending',
    label: 'Make sense of your money',
    title: 'Understand your spending',
    description:
      'Organise transactions into categories and see where your money goes, so you can plan with confidence.',
  },
  {
    feature: 'savings',
    label: 'Make room for what matters',
    title: 'Work towards your saving goals',
    description:
      'Set a target, follow your progress, and build towards the things that matter to you.',
  },
] as const;

export function WelcomeScreen() {
  const router = useRouter();
  const { borderRadius, colors, spacing, typography } = useTheme();
  const pager = useRef<ScrollView>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const currentIndex = useRef(activeIndex);
  useEffect(() => {
    currentIndex.current = activeIndex;
  }, [activeIndex]);

  // Keep the current slide aligned when the viewport changes size.
  useEffect(() => {
    pager.current?.scrollTo({
      x: currentIndex.current * pageWidth,
      animated: false,
    });
  }, [pageWidth]);

  const openLogin = () => router.push('/login');
  const goToSlide = (index: number) => {
    setActiveIndex(index);
    pager.current?.scrollTo({ x: index * pageWidth, animated: false });
  };
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth <= 0) return;
    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setActiveIndex(Math.max(0, Math.min(slides.length - 1, index)));
  };
  const isLastSlide = activeIndex === slides.length - 1;
  let actionLabel = 'Next';
  let actionHint = 'Show the next feature';
  if (isLastSlide) {
    actionLabel = 'Get started';
    actionHint = 'Open the login screen';
  }

  const handleNext = () => {
    if (isLastSlide) {
      openLogin();
      return;
    }
    goToSlide(activeIndex + 1);
  };

  return (
    <AuthScreen isHeaderVisible={false} contentStyle={styles.content}>
      <View style={styles.header}>
        <Label color={colors.accent.primary} size="lg" style={styles.brand}>
          Guallet
        </Label>
        <AuthLink onPress={openLogin}>Log in</AuthLink>
      </View>

      <ScrollView
        ref={pager}
        horizontal
        pagingEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.pagerContent}
        style={styles.pager}
      >
        {slides.map((slide, index) => {
          let accessibilityImportance: 'auto' | 'no-hide-descendants' = 'auto';
          if (index !== activeIndex)
            accessibilityImportance = 'no-hide-descendants';
          return (
            <View
              key={slide.feature}
              aria-hidden={index !== activeIndex}
              accessibilityElementsHidden={index !== activeIndex}
              importantForAccessibility={accessibilityImportance}
              style={[
                styles.slide,
                {
                  width: pageWidth,
                  gap: spacing.lg,
                  paddingVertical: spacing.lg,
                },
              ]}
            >
              <WelcomeIllustration feature={slide.feature} />
              <View
                style={[
                  styles.featureLabel,
                  {
                    backgroundColor: colors.button.secondary.default,
                    borderRadius: borderRadius.xl,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                  },
                ]}
              >
                <Label center size="sm" color={colors.accent.primary}>
                  {slide.label}
                </Label>
              </View>
              <View style={{ gap: spacing.md, width: '100%' }}>
                <Title
                  accessibilityRole="header"
                  center
                  size="xl"
                  style={{
                    lineHeight:
                      typography.sizes.xl * typography.lineHeights.tight,
                  }}
                >
                  {slide.title}
                </Title>
                <Label
                  center
                  color={colors.text.secondary}
                  style={{
                    lineHeight:
                      typography.sizes.md * typography.lineHeights.normal,
                  }}
                >
                  {slide.description}
                </Label>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={{ gap: spacing.sm }}>
        <View style={styles.pagination}>
          {slides.map((slide, index) => {
            let dotColor = colors.surface.border.primary;
            if (index === activeIndex) dotColor = colors.accent.primary;
            return (
              <Pressable
                key={slide.feature}
                accessibilityRole="button"
                accessibilityLabel={`Show feature ${index + 1} of ${slides.length}: ${slide.title}`}
                accessibilityState={{ selected: index === activeIndex }}
                onPress={() => goToSlide(index)}
                style={styles.dotTarget}
              >
                <View
                  style={{
                    backgroundColor: dotColor,
                    borderRadius: borderRadius.xl,
                    height: spacing.sm,
                    width: spacing.sm,
                  }}
                />
              </Pressable>
            );
          })}
        </View>
        <Label
          accessibilityLiveRegion="polite"
          center
          size="xs"
          color={colors.text.secondary}
        >
          {activeIndex + 1} of {slides.length}
        </Label>
        <Button
          accessibilityHint={actionHint}
          onClick={handleNext}
          style={{
            borderRadius: borderRadius.xl,
            height: 'auto',
            minHeight: 48,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
          }}
        >
          {actionLabel}
        </Button>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'space-between', minWidth: 0 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brand: { fontWeight: '700' },
  pager: { flexGrow: 1, flexShrink: 0, width: '100%' },
  pagerContent: { flexGrow: 1 },
  slide: { alignItems: 'center', justifyContent: 'center' },
  featureLabel: { alignSelf: 'center' },
  pagination: { flexDirection: 'row', justifyContent: 'center' },
  dotTarget: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
});
