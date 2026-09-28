import { useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { CheckIcon, ChevronDownIcon, CloseIcon } from '../../../icons';
import { useTheme } from '../../../theme';
import {
  usePickerSheet,
  type DateRangeSheetRenderer,
} from '../DateRangePicker/DateRangeSheetProvider';

/** Matches the web GualletColorPicker presets, including repeated entries. */
export const DEFAULT_COLOR_SWATCHES = [
  '#25262b',
  '#868e96',
  '#fa5252',
  '#e64980',
  '#be4bdb',
  '#7950f2',
  '#4c6ef5',
  '#228be6',
  '#15aabf',
  '#12b886',
  '#40c057',
  '#82c91e',
  '#fab005',
  '#fd7e14',
  '#fd7e14',
  '#fd7e14',
];

export interface ColorPickerProps {
  value: string | null;
  colors?: string[];
  onChange: (color: string) => void;
  onCancel?: () => void;
  style?: StyleProp<ViewStyle>;
  bottomSheetStyle?: StyleProp<ViewStyle>;
  swatchStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/** A controlled preset color picker using the host app's native bottom sheet. */
export function ColorPicker({
  value,
  colors: palette = DEFAULT_COLOR_SWATCHES,
  onChange,
  onCancel,
  style,
  bottomSheetStyle,
  swatchStyle,
  textStyle,
}: Readonly<ColorPickerProps>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const renderSheet = usePickerSheet();
  if (!renderSheet) {
    throw new Error('ColorPicker requires PickerSheetProvider.');
  }

  const [visible, setVisible] = useState(false);
  const openRef = useRef(false);
  const selectedIndex = palette.findIndex(
    (color) => color.toLowerCase() === value?.toLowerCase(),
  );

  function open() {
    if (openRef.current) return;
    openRef.current = true;
    setVisible(true);
  }

  function cancel() {
    if (!openRef.current) return;
    openRef.current = false;
    setVisible(false);
    onCancel?.();
  }

  function select(color: string) {
    if (!openRef.current) return;
    openRef.current = false;
    setVisible(false);
    onChange(color);
  }

  const label = value ? value.toUpperCase() : 'Select a colour';

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Colour, ${label}`}
        accessibilityHint="Opens colour picker"
        onPress={open}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surface.background.input,
            borderColor: colors.surface.border.input,
            borderRadius: borderRadius.md,
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
          },
          style,
        ]}
      >
        <View
          accessible={false}
          style={[
            styles.triggerSwatch,
            {
              backgroundColor: value ?? colors.surface.background.secondary,
              borderColor: colors.surface.border.input,
              borderRadius: borderRadius.xl,
            },
          ]}
        />
        <Text
          numberOfLines={1}
          style={[
            styles.triggerText,
            {
              color: value ? colors.text.primary : colors.text.placeholder,
              fontSize: typography.sizes.md,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
        <ChevronDownIcon
          size={20}
          color={colors.text.secondary}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </Pressable>
      <ColorSheetFrame
        renderSheet={renderSheet}
        visible={visible}
        onDismiss={cancel}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface.background.primary,
              padding: spacing.md,
            },
            bottomSheetStyle,
          ]}
        >
          <View style={styles.header}>
            <Text
              accessibilityRole="header"
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.lg,
                fontWeight: '600',
              }}
            >
              Choose a colour
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close colour picker"
              onPress={cancel}
              style={styles.closeButton}
            >
              <CloseIcon
                size={20}
                color={colors.text.secondary}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
            </Pressable>
          </View>
          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.surface.border.primary,
                marginBottom: spacing.md,
              },
            ]}
          />
          <ScrollView showsVerticalScrollIndicator={false}>
            {palette.length === 0 ? (
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.sizes.sm,
                }}
              >
                No colours available
              </Text>
            ) : (
              <View style={styles.grid} accessibilityRole="radiogroup">
                {palette.map((color, index) => {
                  const selected = index === selectedIndex;
                  return (
                    <Pressable
                      key={`${color}-${index}`}
                      accessibilityRole="radio"
                      accessibilityLabel={`Colour ${color.toUpperCase()}`}
                      accessibilityState={{ selected }}
                      onPress={() => select(color)}
                      style={[
                        styles.swatchButton,
                        { marginBottom: spacing.sm },
                      ]}
                    >
                      <View
                        style={[
                          styles.swatch,
                          {
                            backgroundColor: color,
                            borderRadius: borderRadius.xl,
                          },
                          swatchStyle,
                          selected && {
                            borderColor: colors.accent.primary,
                            borderWidth: 2,
                          },
                        ]}
                      >
                        {selected && (
                          <CheckIcon
                            size={20}
                            color={
                              isLightColor(color)
                                ? colors.text.primary
                                : colors.text.inverse
                            }
                            accessibilityElementsHidden
                            importantForAccessibility="no"
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </ColorSheetFrame>
    </>
  );
}

function ColorSheetFrame({
  renderSheet,
  visible,
  onDismiss,
  children,
}: Readonly<{
  renderSheet: DateRangeSheetRenderer;
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
}>) {
  return renderSheet({ visible, onDismiss, children, snapPoints: ['half'] });
}

/** Keep the selected check visible on light and dark custom swatches. */
function isLightColor(color: string): boolean {
  const rawHex = color.replace('#', '');
  const hex =
    rawHex.length === 3
      ? Array.from(rawHex, (character) => character.repeat(2)).join('')
      : rawHex;
  const channels = [0, 2, 4].map((offset) =>
    Number.parseInt(hex.slice(offset, offset + 2), 16),
  );
  const brightness =
    (channels[0] * 299 + channels[1] * 587 + channels[2] * 114) / 1000;
  return brightness > 160;
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
  },
  triggerSwatch: { borderWidth: 1, height: 24, width: 24 },
  triggerText: { flex: 1 },
  sheet: { flex: 1, width: '100%' },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  divider: { height: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  swatchButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '16.666667%',
  },
  swatch: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
