import { useTheme } from '@guallet/luna-mobile';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

type WelcomeFeature = 'accounts' | 'spending' | 'savings';

/** Original decorative artwork; feature descriptions carry its meaning. */
export function WelcomeIllustration({
  feature,
}: Readonly<{ feature: WelcomeFeature }>) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.illustration}
    >
      <Svg width="100%" height="100%" viewBox="0 0 320 240">
        <Circle
          cx="160"
          cy="118"
          r="104"
          fill={colors.button.secondary.default}
        />
        <Ellipse
          cx="160"
          cy="214"
          rx="122"
          ry="10"
          fill={colors.surface.border.primary}
        />
        {feature === 'accounts' && <AccountsArtwork />}
        {feature === 'spending' && <SpendingArtwork />}
        {feature === 'savings' && <SavingsArtwork />}
        <Circle cx="42" cy="69" r="5" fill={colors.accent.secondary} />
        <Circle cx="282" cy="166" r="4" fill={colors.accent.secondary} />
        <Path
          d="M270 44 v16 M262 52 h16"
          stroke={colors.accent.primary}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

/** Illustrate multiple accounts with overlapping cards and a check mark. */
function AccountsArtwork() {
  const { colors, borderRadius } = useTheme();
  return (
    <>
      <G rotation="-12" origin="130,120">
        <Rect
          x="44"
          y="66"
          width="186"
          height="118"
          rx={borderRadius.lg}
          fill={colors.accent.secondary}
        />
        <Rect
          x="62"
          y="87"
          width="30"
          height="23"
          rx={borderRadius.sm}
          fill={colors.surface.background.primary}
        />
        <Line
          x1="62"
          y1="147"
          x2="135"
          y2="147"
          stroke={colors.surface.background.primary}
          strokeWidth="6"
          strokeLinecap="round"
        />
      </G>
      <G rotation="8" origin="185,146">
        <Rect
          x="94"
          y="98"
          width="186"
          height="118"
          rx={borderRadius.lg}
          fill={colors.accent.primary}
        />
        <Rect
          x="112"
          y="116"
          width="30"
          height="23"
          rx={borderRadius.sm}
          fill={colors.accent.light}
        />
        <Path
          d="M114 178 h72 M114 193 h42"
          stroke={colors.text.inverse}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <Circle cx="239" cy="188" r="12" fill={colors.accent.secondary} />
        <Circle cx="253" cy="188" r="12" fill={colors.accent.light} />
      </G>
      <Circle
        cx="245"
        cy="68"
        r="27"
        fill={colors.surface.background.primary}
        stroke={colors.surface.border.primary}
        strokeWidth="1"
      />
      <Path
        d="M232 68 l9 9 17 -18"
        fill="none"
        stroke={colors.support.primary}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

/** Illustrate categorised spending with a chart and category symbols. */
function SpendingArtwork() {
  const { colors, borderRadius } = useTheme();
  return (
    <>
      <Rect
        x="61"
        y="39"
        width="198"
        height="174"
        rx={borderRadius.lg}
        fill={colors.surface.background.primary}
        stroke={colors.surface.border.primary}
        strokeWidth="1"
      />
      <Path
        d="M83 64 h76 M83 78 h44"
        stroke={colors.surface.border.primary}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <Rect
        x="85"
        y="145"
        width="23"
        height="39"
        rx={borderRadius.sm}
        fill={colors.accent.light}
      />
      <Rect
        x="125"
        y="122"
        width="23"
        height="62"
        rx={borderRadius.sm}
        fill={colors.accent.secondary}
      />
      <Rect
        x="165"
        y="139"
        width="23"
        height="45"
        rx={borderRadius.sm}
        fill={colors.accent.light}
      />
      <Rect
        x="205"
        y="103"
        width="23"
        height="81"
        rx={borderRadius.sm}
        fill={colors.accent.primary}
      />
      <Line
        x1="82"
        y1="192"
        x2="236"
        y2="192"
        stroke={colors.surface.border.primary}
        strokeWidth="2"
      />
      <Circle cx="65" cy="150" r="29" fill={colors.accent.primary} />
      <Path
        d="M52 141 h23 l-3 15 h-17 z M57 138 v-4 M65 138 v-4 M72 138 v-4 M52 161 h22"
        fill="none"
        stroke={colors.text.inverse}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="259" cy="88" r="29" fill={colors.accent.secondary} />
      <Path
        d="M245 88 l14 -12 14 12 M249 86 v16 h20 v-16 M256 102 v-9 h6 v9"
        fill="none"
        stroke={colors.text.inverse}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

/** Illustrate progress towards saving goals with partially filled jars. */
function SavingsArtwork() {
  const { colors, borderRadius } = useTheme();
  return (
    <>
      <G rotation="-7" origin="89,153">
        <Rect
          x="49"
          y="104"
          width="80"
          height="104"
          rx={borderRadius.lg}
          fill={colors.surface.background.primary}
          stroke={colors.accent.secondary}
          strokeWidth="2"
        />
        <Rect
          x="55"
          y="159"
          width="68"
          height="43"
          rx={borderRadius.md}
          fill={colors.accent.secondary}
        />
        <Rect
          x="54"
          y="94"
          width="70"
          height="15"
          rx={borderRadius.sm}
          fill={colors.accent.secondary}
        />
        <Path
          d="M78 134 l11 -10 11 10 M81 133 v12 h16 v-12"
          stroke={colors.accent.primary}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <G rotation="7" origin="233,153">
        <Rect
          x="196"
          y="104"
          width="76"
          height="104"
          rx={borderRadius.lg}
          fill={colors.surface.background.primary}
          stroke={colors.accent.secondary}
          strokeWidth="2"
        />
        <Rect
          x="202"
          y="177"
          width="64"
          height="25"
          rx={borderRadius.md}
          fill={colors.accent.secondary}
        />
        <Rect
          x="201"
          y="94"
          width="66"
          height="15"
          rx={borderRadius.sm}
          fill={colors.accent.secondary}
        />
        <Path
          d="M223 135 h22 M234 124 v22 M223 135 l22 -11"
          stroke={colors.accent.primary}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </G>
      <Rect
        x="115"
        y="87"
        width="94"
        height="129"
        rx={borderRadius.lg}
        fill={colors.surface.background.primary}
        stroke={colors.accent.primary}
        strokeWidth="2"
      />
      <Rect
        x="121"
        y="145"
        width="82"
        height="65"
        rx={borderRadius.md}
        fill={colors.support.primary}
      />
      <Rect
        x="121"
        y="77"
        width="82"
        height="17"
        rx={borderRadius.sm}
        fill={colors.accent.primary}
      />
      <Path
        d="M150 119 l8 8 16 -17"
        stroke={colors.support.primary}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="164" cy="43" r="20" fill={colors.support.primary} />
      <Circle
        cx="164"
        cy="43"
        r="13"
        fill="none"
        stroke={colors.text.inverse}
        strokeWidth="1.5"
      />
      <Line
        x1="164"
        y1="36"
        x2="164"
        y2="50"
        stroke={colors.text.inverse}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  );
}

const styles = StyleSheet.create({
  illustration: { aspectRatio: 4 / 3, maxWidth: 320, width: '100%' },
});
