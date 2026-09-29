import { useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  SearchIcon,
} from '../../../icons';
import { useTheme } from '../../../theme';
import {
  usePickerSheet,
  type DateRangeSheetRenderer,
} from '../DateRangePicker/DateRangeSheetProvider';
import {
  getCurrencySections,
  type CurrencyPickerCurrency,
} from './currencyPickerUtils';

interface BaseCurrencyPickerProps {
  currencies: CurrencyPickerCurrency[];
  defaultCurrencyCode?: string;
  preferredCurrencyCodes?: string[];
  /** Show the default currency in its own section. Defaults to true. */
  showDefaultCurrency?: boolean;
  /** Show preferred currencies in their own section. Defaults to true. */
  showPreferredCurrencies?: boolean;
  title?: string;
  placeholder?: string;
  disabled?: boolean;
  onCancel?: () => void;
  style?: StyleProp<ViewStyle>;
  bottomSheetStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** Let existing form controls and settings rows open the same picker. */
  renderTrigger?: (props: { open: () => void; visible: boolean }) => ReactNode;
}

interface SingleCurrencyPickerProps extends BaseCurrencyPickerProps {
  selectionMode: 'single';
  value: string | null;
  /** Return false after a failed save to keep the selection sheet open. */
  onChange: (value: string) => void | boolean | Promise<void | boolean>;
  onConfirm?: never;
}

interface MultipleCurrencyPickerProps extends BaseCurrencyPickerProps {
  selectionMode: 'multiple';
  value: string[] | null;
  /** Return false after a failed save to retain the staged selection. */
  onConfirm: (values: string[]) => void | boolean | Promise<void | boolean>;
  onChange?: never;
}

export type CurrencyPickerProps =
  | SingleCurrencyPickerProps
  | MultipleCurrencyPickerProps;

/** Searchable currency picker backed by the host app's native bottom sheet. */
export function CurrencyPicker(props: Readonly<CurrencyPickerProps>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const renderSheet = usePickerSheet();
  if (!renderSheet)
    throw new Error('CurrencyPicker requires PickerSheetProvider.');

  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [draftCodes, setDraftCodes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const openRef = useRef(false);
  const savingRef = useRef(false);
  const selectedCode = props.selectionMode === 'single' ? props.value : null;
  const selectedCodes =
    props.selectionMode === 'multiple'
      ? draftCodes
      : selectedCode
        ? [selectedCode]
        : [];
  const selectedSet = new Set(selectedCodes.map((code) => code.toUpperCase()));
  const sections = getCurrencySections(
    props.currencies,
    query,
    props.defaultCurrencyCode,
    props.preferredCurrencyCodes,
    props.showDefaultCurrency,
    props.showPreferredCurrencies,
  );
  const selectedCurrency = props.currencies.find(
    (currency) => currency.code === selectedCode,
  );
  const placeholder = props.placeholder ?? 'Select a currency';
  const label =
    props.selectionMode === 'single'
      ? selectedCurrency
        ? `${selectedCurrency.symbol} · ${selectedCurrency.name} · ${selectedCurrency.code}`
        : placeholder
      : props.value?.length
        ? `${props.value.length} currencies selected`
        : (props.placeholder ?? 'Select currencies');
  const CustomTrigger = props.renderTrigger;

  function open() {
    if (props.disabled || openRef.current) return;
    setQuery('');
    setDraftCodes(
      props.selectionMode === 'multiple' ? [...(props.value ?? [])] : [],
    );
    openRef.current = true;
    setVisible(true);
  }

  function cancel() {
    if (!openRef.current || savingRef.current) return;
    openRef.current = false;
    setVisible(false);
    setQuery('');
    props.onCancel?.();
  }

  async function select(code: string) {
    if (props.selectionMode === 'single') {
      if (savingRef.current) return;
      savingRef.current = true;
      setSaving(true);
      try {
        if ((await props.onChange(code)) !== false) {
          openRef.current = false;
          setVisible(false);
          setQuery('');
        }
      } catch {
        // Keep the sheet open if the caller's save rejects.
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
      return;
    }
    setDraftCodes((current) =>
      current.includes(code)
        ? current.filter((currentCode) => currentCode !== code)
        : [...current, code],
    );
  }

  async function confirm() {
    if (props.selectionMode !== 'multiple' || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      if ((await props.onConfirm(draftCodes)) !== false) {
        openRef.current = false;
        setVisible(false);
        setQuery('');
      }
    } catch {
      // Retain the staged selection so the user can retry.
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <>
      {CustomTrigger ? (
        <CustomTrigger open={open} visible={visible} />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Currency, ${label}`}
          accessibilityHint="Opens currency picker"
          accessibilityState={{ disabled: props.disabled, expanded: visible }}
          disabled={props.disabled}
          onPress={open}
          style={[
            styles.trigger,
            {
              backgroundColor: props.disabled
                ? colors.surface.background.disabled
                : colors.surface.background.input,
              borderColor: colors.surface.border.input,
              borderRadius: borderRadius.md,
              paddingHorizontal: spacing.md,
            },
            props.style,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.triggerText,
              {
                color: props.value
                  ? colors.text.primary
                  : colors.text.placeholder,
                fontSize: typography.sizes.md,
              },
              props.textStyle,
            ]}
          >
            {label}
          </Text>
          <ChevronDownIcon
            accessible={false}
            color={colors.text.secondary}
            size={20}
          />
        </Pressable>
      )}
      <CurrencySheetFrame
        renderSheet={renderSheet}
        visible={visible}
        onDismiss={cancel}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface.background.primary,
              paddingTop: spacing.sm,
            },
            props.bottomSheetStyle,
          ]}
        >
          <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
            <Text
              accessibilityRole="header"
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.xl,
                fontWeight: '700',
              }}
            >
              {props.title ??
                (props.selectionMode === 'single'
                  ? 'Choose currency'
                  : 'Choose currencies')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel currency selection"
              accessibilityState={{ disabled: saving }}
              disabled={saving}
              onPress={cancel}
              style={styles.close}
            >
              <CloseIcon
                accessible={false}
                color={colors.text.primary}
                size={22}
              />
            </Pressable>
          </View>
          <View
            style={[
              styles.search,
              {
                backgroundColor: colors.surface.background.secondary,
                borderColor: colors.surface.border.input,
                borderRadius: borderRadius.md,
                marginHorizontal: spacing.md,
                marginBottom: spacing.sm,
                paddingHorizontal: spacing.sm,
              },
            ]}
          >
            <SearchIcon
              accessible={false}
              color={colors.text.secondary}
              size={20}
            />
            <TextInput
              accessibilityLabel="Search currencies"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!saving}
              onChangeText={setQuery}
              placeholder="Search name, code or symbol"
              placeholderTextColor={colors.text.placeholder}
              returnKeyType="search"
              style={[
                styles.searchInput,
                { color: colors.text.primary, fontSize: typography.sizes.md },
              ]}
              value={query}
            />
            {query.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear currency search"
                accessibilityState={{ disabled: saving }}
                disabled={saving}
                onPress={() => setQuery('')}
                hitSlop={spacing.sm}
              >
                <CloseIcon
                  accessible={false}
                  color={colors.text.secondary}
                  size={18}
                />
              </Pressable>
            )}
          </View>
          <SectionList
            sections={sections}
            style={styles.results}
            keyExtractor={(currency) => currency.code}
            keyboardShouldPersistTaps="always"
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{
              paddingHorizontal: spacing.md,
              paddingBottom: spacing.lg,
            }}
            ListEmptyComponent={
              <Text
                style={{
                  color: colors.text.secondary,
                  paddingVertical: spacing.lg,
                  textAlign: 'center',
                }}
              >
                No currencies found.
              </Text>
            }
            renderSectionHeader={({ section }) => (
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text.secondary,
                    fontSize: typography.sizes.sm,
                    marginTop: spacing.lg,
                    marginBottom: spacing.sm,
                  },
                ]}
              >
                {section.title}
              </Text>
            )}
            renderItem={({ item }) => (
              <CurrencyRow
                currency={item}
                selected={selectedSet.has(item.code)}
                multiple={props.selectionMode === 'multiple'}
                disabled={saving}
                onPress={() => void select(item.code)}
              />
            )}
          />
          {props.selectionMode === 'multiple' && (
            <View
              style={[
                styles.footer,
                {
                  borderTopColor: colors.surface.border.primary,
                  padding: spacing.md,
                },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Confirm ${draftCodes.length} currencies`}
                accessibilityState={{ disabled: saving }}
                disabled={saving}
                onPress={() => void confirm()}
                style={[
                  styles.confirm,
                  {
                    backgroundColor: colors.button.primary.default,
                    borderRadius: borderRadius.md,
                  },
                ]}
              >
                <Text
                  style={{
                    color: colors.text.inverse,
                    fontSize: typography.sizes.md,
                    fontWeight: '600',
                  }}
                >{`Confirm ${draftCodes.length} currencies`}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </CurrencySheetFrame>
    </>
  );
}

function CurrencyRow({
  currency,
  selected,
  multiple,
  disabled,
  onPress,
}: Readonly<{
  currency: CurrencyPickerCurrency;
  selected: boolean;
  multiple: boolean;
  disabled: boolean;
  onPress: () => void;
}>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  return (
    <Pressable
      accessibilityRole={multiple ? 'checkbox' : 'button'}
      accessibilityLabel={`${currency.name}, ${currency.code}`}
      accessibilityState={{
        checked: multiple ? selected : undefined,
        disabled,
        selected,
      }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor:
            selected && !multiple
              ? colors.button.secondary.default
              : colors.surface.background.primary,
          borderColor:
            selected && !multiple
              ? colors.accent.primary
              : colors.surface.border.primary,
          borderRadius: borderRadius.md,
          marginBottom: spacing.xs,
          paddingHorizontal: spacing.sm,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.badge,
          {
            backgroundColor: colors.button.secondary.default,
            borderRadius: borderRadius.md,
            marginRight: spacing.sm,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            color: colors.accent.primary,
            fontSize: typography.sizes.md,
            fontWeight: '700',
          }}
        >
          {currency.symbol}
        </Text>
      </View>
      <View style={styles.details}>
        <Text
          numberOfLines={1}
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.md,
            fontWeight: '600',
          }}
        >
          {currency.name}
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.sm,
          }}
        >
          {currency.code}
        </Text>
      </View>
      {multiple ? (
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: selected
                ? colors.accent.primary
                : colors.surface.background.primary,
              borderColor: selected
                ? colors.accent.primary
                : colors.text.secondary,
              borderRadius: borderRadius.sm,
            },
          ]}
        >
          {selected && (
            <CheckIcon
              accessible={false}
              color={colors.text.inverse}
              size={16}
            />
          )}
        </View>
      ) : selected ? (
        <CheckIcon accessible={false} color={colors.accent.primary} size={24} />
      ) : null}
    </Pressable>
  );
}

function CurrencySheetFrame({
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
  return renderSheet({ visible, onDismiss, children, snapPoints: ['full'] });
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
  },
  triggerText: { flex: 1 },
  sheet: { flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  close: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    width: 44,
  },
  search: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
  },
  searchInput: { flex: 1, marginLeft: 8, paddingVertical: 8 },
  results: { flex: 1 },
  sectionTitle: { fontWeight: '700', textTransform: 'uppercase' },
  row: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 68,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    width: 42,
  },
  details: { flex: 1 },
  checkbox: {
    alignItems: 'center',
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  footer: { borderTopWidth: StyleSheet.hairlineWidth },
  confirm: { alignItems: 'center', justifyContent: 'center', minHeight: 50 },
});
