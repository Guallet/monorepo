import { useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
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
  accountInputLabel,
  groupAccounts,
  type AccountPickerItem,
} from './accountInputUtils';

export type { AccountPickerItem } from './accountInputUtils';

interface BaseAccountInputProps {
  accounts: AccountPickerItem[];
  placeholder?: string;
  onCancel?: () => void;
  style?: StyleProp<ViewStyle>;
  bottomSheetStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accountRowStyle?: StyleProp<ViewStyle>;
}

interface SingleAccountInputProps extends BaseAccountInputProps {
  selectionMode: 'single';
  value: string | null;
  onChange: (value: string) => void;
  onConfirm?: never;
}

interface MultipleAccountInputProps extends BaseAccountInputProps {
  selectionMode: 'multiple';
  value: string[] | null;
  onConfirm: (values: string[]) => void;
  onChange?: never;
}

export type AccountInputProps =
  | SingleAccountInputProps
  | MultipleAccountInputProps;

/** Controlled account picker. Multiple selections remain local until Select. */
export function AccountInput(props: Readonly<AccountInputProps>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const renderSheet = usePickerSheet();
  if (!renderSheet) {
    throw new Error('AccountInput requires PickerSheetProvider.');
  }

  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const openRef = useRef(false);
  const placeholder =
    props.placeholder ??
    (props.selectionMode === 'single'
      ? 'Select an account'
      : 'Select accounts');
  const label = accountInputLabel(
    props.accounts,
    props.value,
    props.selectionMode,
    placeholder,
  );
  const hasValue =
    props.selectionMode === 'single'
      ? props.value !== null
      : Boolean(props.value?.length);
  const groups = groupAccounts(props.accounts, query);
  const singleId = props.selectionMode === 'single' ? props.value : null;

  function open() {
    setQuery('');
    setDraftIds(
      props.selectionMode === 'multiple' ? [...(props.value ?? [])] : [],
    );
    openRef.current = true;
    setVisible(true);
  }

  /** The close button and native dismissal share one cancellation path. */
  function cancel() {
    if (!openRef.current) return;
    openRef.current = false;
    setVisible(false);
    props.onCancel?.();
  }

  function select(accountId: string) {
    if (props.selectionMode === 'single') {
      openRef.current = false;
      setVisible(false);
      props.onChange(accountId);
      return;
    }
    setDraftIds((current) =>
      current.includes(accountId)
        ? current.filter((id) => id !== accountId)
        : [...current, accountId],
    );
  }

  function confirm() {
    if (props.selectionMode !== 'multiple') return;
    openRef.current = false;
    setVisible(false);
    props.onConfirm(draftIds);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Account, ${label}`}
        accessibilityHint="Opens account picker"
        onPress={open}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surface.background.input,
            borderColor: colors.surface.border.input,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.md,
            gap: spacing.sm,
          },
          props.style,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.triggerText,
            {
              color: hasValue ? colors.text.primary : colors.text.placeholder,
              fontSize: typography.sizes.md,
            },
            props.textStyle,
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
      <AccountSheetFrame
        title={props.selectionMode === 'single' ? 'Select an account' : 'Select accounts'}
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
                gap: spacing.sm,
              },
            ]}
          >
            <SearchIcon
              size={20}
              color={colors.text.secondary}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <TextInput
              accessibilityLabel="Search accounts"
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder="Search accounts"
              placeholderTextColor={colors.text.placeholder}
              returnKeyType="search"
              style={[
                styles.searchInput,
                {
                  color: colors.text.primary,
                  fontSize: typography.sizes.sm,
                },
              ]}
              value={query}
            />
            {query.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear account search"
                hitSlop={spacing.sm}
                onPress={() => setQuery('')}
                style={styles.clear}
              >
                <CloseIcon size={18} color={colors.text.secondary} />
              </Pressable>
            )}
          </View>
          <ScrollView
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
            style={styles.results}
            contentContainerStyle={{
              paddingHorizontal: spacing.md,
              paddingBottom: spacing.lg,
            }}
          >
            {groups.length === 0 ? (
              <View
                style={[styles.empty, { gap: spacing.sm, padding: spacing.lg }]}
              >
                <SearchIcon size={32} color={colors.text.secondary} />
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: typography.sizes.md,
                    fontWeight: '600',
                  }}
                >
                  {query.trim() ? 'No accounts found' : 'No accounts available'}
                </Text>
                {query.trim() && (
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: typography.sizes.sm,
                    }}
                  >
                    Try another account name.
                  </Text>
                )}
              </View>
            ) : (
              groups.map((group) => (
                <View key={group.type}>
                  <Text
                    accessibilityRole="header"
                    style={[
                      styles.groupTitle,
                      {
                        color: colors.text.secondary,
                        fontSize: typography.sizes.xs,
                        marginTop: spacing.md,
                        marginBottom: spacing.xs,
                      },
                    ]}
                  >
                    {group.title}
                  </Text>
                  {group.items.map((account) => {
                    const selected =
                      props.selectionMode === 'single'
                        ? singleId === account.id
                        : draftIds.includes(account.id);
                    return (
                      <Pressable
                        key={account.id}
                        accessibilityRole={
                          props.selectionMode === 'single'
                            ? 'radio'
                            : 'checkbox'
                        }
                        accessibilityLabel={account.name}
                        accessibilityState={
                          props.selectionMode === 'single'
                            ? { selected }
                            : { checked: selected }
                        }
                        onPress={() => select(account.id)}
                        style={({ pressed }) => [
                          styles.row,
                          {
                            borderBottomColor: colors.surface.border.primary,
                            gap: spacing.sm,
                            opacity: pressed ? 0.7 : 1,
                          },
                          props.accountRowStyle,
                        ]}
                      >
                        <View
                          style={[
                            styles.avatar,
                            {
                              backgroundColor: colors.button.secondary.default,
                              borderRadius: borderRadius.md,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color: colors.accent.primary,
                              fontSize: typography.sizes.xs,
                              fontWeight: '700',
                            }}
                          >
                            {accountInitials(account.name)}
                          </Text>
                        </View>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.accountName,
                            {
                              color: colors.text.primary,
                              fontSize: typography.sizes.md,
                            },
                          ]}
                        >
                          {account.name}
                        </Text>
                        <View
                          style={[
                            styles.indicator,
                            props.selectionMode === 'single'
                              ? { borderRadius: borderRadius.xl }
                              : { borderRadius: borderRadius.sm },
                            {
                              borderColor: selected
                                ? colors.accent.primary
                                : colors.surface.border.input,
                              backgroundColor:
                                selected && props.selectionMode === 'multiple'
                                  ? colors.accent.primary
                                  : colors.surface.background.primary,
                            },
                          ]}
                        >
                          {selected && props.selectionMode === 'single' && (
                            <View
                              style={[
                                styles.radioDot,
                                {
                                  backgroundColor: colors.accent.primary,
                                  borderRadius: borderRadius.xl,
                                },
                              ]}
                            />
                          )}
                          {selected && props.selectionMode === 'multiple' && (
                            <CheckIcon size={16} color={colors.text.inverse} />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))
            )}
          </ScrollView>
          {props.selectionMode === 'multiple' && (
            <View
              style={[
                styles.footer,
                {
                  borderTopColor: colors.surface.border.primary,
                  padding: spacing.md,
                  gap: spacing.sm,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.sizes.xs,
                  textAlign: 'center',
                }}
              >
                {draftIds.length === 1
                  ? '1 account selected'
                  : `${draftIds.length} accounts selected`}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Select accounts"
                onPress={confirm}
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
                >
                  Select
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </AccountSheetFrame>
    </>
  );
}

/** Defer the app's renderer to a component boundary. */
function AccountSheetFrame({
  title,
  renderSheet,
  visible,
  onDismiss,
  children,
}: Readonly<{
  title: string;
  renderSheet: DateRangeSheetRenderer;
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
}>) {
  return renderSheet({ title, showCloseIcon: true, visible, onDismiss, children, snapPoints: ['full'] });
}

function accountInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1)
    return Array.from(words[0]).slice(0, 2).join('').toUpperCase();
  return `${Array.from(words[0])[0]}${Array.from(words[1])[0]}`.toUpperCase();
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
  search: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    height: 44,
  },
  searchInput: { flex: 1, padding: 0 },
  clear: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  results: { flex: 1 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  groupTitle: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 56,
  },
  avatar: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  accountName: { flex: 1, fontWeight: '600' },
  indicator: {
    alignItems: 'center',
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  radioDot: { height: 12, width: 12 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth },
  confirm: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});
