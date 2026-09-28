import {
  isCategoryIconName,
  selectableCategoryIconNames,
} from '@guallet/theme';
import { useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { CategoryIcon, ChevronDownIcon, CloseIcon } from '../../../icons';
import { useTheme } from '../../../theme';
import {
  usePickerSheet,
  type DateRangeSheetRenderer,
} from '../DateRangePicker/DateRangeSheetProvider';

export interface IconPickerProps {
  value: string | null;
  /** Defaults to the shared, predefined selectable category icons. */
  icons?: string[];
  onChange: (iconName: string) => void;
  /** Called when the sheet closes without a selection. */
  onCancel?: () => void;
  style?: StyleProp<ViewStyle>;
  bottomSheetStyle?: StyleProp<ViewStyle>;
  iconGridStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

function iconLabel(name: string): string {
  return name
    .replace(/^Icon/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-z])([0-9])/g, '$1 $2');
}

/** A controlled category icon picker using the host app's native BottomSheet. */
export function IconPicker({
  value,
  icons = [...selectableCategoryIconNames],
  onChange,
  onCancel,
  style,
  bottomSheetStyle,
  iconGridStyle,
  textStyle,
}: Readonly<IconPickerProps>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const renderSheet = usePickerSheet();
  const { height: windowHeight } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const openRef = useRef(false);

  if (!renderSheet) {
    throw new Error('IconPicker requires PickerSheetProvider.');
  }

  const availableIcons = [...new Set(icons.filter(isCategoryIconName))];
  const selectedIcon = isCategoryIconName(value) ? value : null;
  const label = selectedIcon ? iconLabel(selectedIcon) : 'Choose an icon';
  const touchSize = spacing.xxl + spacing.xs;

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

  function select(iconName: string) {
    if (!openRef.current) return;
    openRef.current = false;
    setVisible(false);
    onChange(iconName);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Icon, ${label}`}
        accessibilityHint="Opens category icon picker"
        onPress={open}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surface.background.primary,
            borderColor: colors.surface.border.input,
            borderRadius: borderRadius.md,
            gap: spacing.sm,
            minHeight: spacing.xl + spacing.lg,
            paddingHorizontal: spacing.md,
          },
          style,
        ]}
      >
        {selectedIcon && (
          <View
            accessible={false}
            style={[
              styles.preview,
              {
                backgroundColor: colors.surface.background.input,
                borderRadius: borderRadius.md,
                height: spacing.xl,
                width: spacing.xl,
              },
            ]}
          >
            <CategoryIcon
              name={selectedIcon}
              size={spacing.lg}
              color={colors.accent.primary}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </View>
        )}
        <Text
          numberOfLines={1}
          style={[
            styles.triggerText,
            {
              color: selectedIcon
                ? colors.text.primary
                : colors.text.placeholder,
              fontSize: typography.sizes.md,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
        <ChevronDownIcon
          size={spacing.lg}
          color={colors.text.secondary}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </Pressable>
      <IconSheetFrame
        renderSheet={renderSheet}
        visible={visible}
        onDismiss={cancel}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface.background.primary,
              maxHeight: windowHeight * 0.72,
              paddingHorizontal: spacing.md,
              paddingBottom: spacing.md,
            },
            bottomSheetStyle,
          ]}
        >
          <View
            style={[styles.header, { minHeight: spacing.xxl + spacing.lg }]}
          >
            <Text
              accessibilityRole="header"
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.lg,
                fontWeight: '600',
              }}
            >
              Choose an icon
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close icon picker"
              onPress={cancel}
              style={[
                styles.closeButton,
                { minHeight: touchSize, minWidth: touchSize },
              ]}
            >
              <CloseIcon
                size={spacing.lg}
                color={colors.text.secondary}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
            </Pressable>
          </View>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
              marginBottom: spacing.md,
            }}
          >
            Tap an icon to use it
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {availableIcons.length === 0 ? (
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.sizes.sm,
                }}
              >
                No icons available
              </Text>
            ) : (
              <View
                accessibilityRole="radiogroup"
                style={[styles.grid, iconGridStyle]}
              >
                {availableIcons.map((iconName) => {
                  const selected = iconName === selectedIcon;
                  return (
                    <View key={iconName} style={styles.gridCell}>
                      <Pressable
                        accessibilityRole="radio"
                        accessibilityLabel={iconLabel(iconName)}
                        accessibilityState={{ selected }}
                        onPress={() => select(iconName)}
                        style={[
                          styles.iconButton,
                          {
                            backgroundColor: selected
                              ? colors.surface.background.input
                              : colors.surface.background.primary,
                            borderColor: selected
                              ? colors.accent.primary
                              : colors.surface.border.input,
                            borderRadius: borderRadius.lg,
                            height: spacing.xxl + spacing.md,
                            width: spacing.xxl + spacing.md,
                            marginBottom: spacing.sm,
                          },
                          selected && styles.selectedIconButton,
                        ]}
                      >
                        <CategoryIcon
                          name={iconName}
                          size={spacing.lg}
                          color={
                            selected
                              ? colors.accent.primary
                              : colors.neutral.darkGrey
                          }
                          accessibilityElementsHidden
                          importantForAccessibility="no"
                        />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </IconSheetFrame>
    </>
  );
}

function IconSheetFrame({
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
  return renderSheet({ visible, onDismiss, children });
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
  },
  triggerText: { flex: 1 },
  preview: { alignItems: 'center', justifyContent: 'center' },
  sheet: { width: '100%' },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeButton: { alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridCell: { alignItems: 'center', width: '20%' },
  iconButton: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
  },
  selectedIconButton: { borderWidth: 2 },
});
