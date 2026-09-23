import { BottomSheet } from '@expo/ui';
import {
  IconChevronDown,
  IconChevronRight,
  IconSearch,
} from '@tabler/icons-react-native';
import { useMemo, useRef, useState } from 'react';
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
import { CategoryIcon } from '../../icons/CategoryIcon';
import { useTheme } from '../../theme';
import {
  buildCategoryPickerTree,
  toggleCategorySelection,
  type CategoryPickerItem,
} from './categoryPicker.utils';

type CategoryPickerCommonProps = {
  categories: CategoryPickerItem[];
  recentCategoryIds?: string[];
  placeholder?: string;
  allowClear?: boolean;
  clearLabel?: string;
  style?: StyleProp<ViewStyle>;
  bottomSheetStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  categoryRowStyle?: StyleProp<ViewStyle>;
  onCancel?: () => void;
};

type SingleSelectionProps = {
  selectionMode: 'single';
  value: string | null;
  onChange: (value: string | null) => void;
  onConfirm?: never;
};

type MultipleSelectionProps = {
  selectionMode: 'multiple';
  value: string[] | null;
  onChange?: never;
  onConfirm: (values: string[]) => void;
};

export type CategoryPickerProps = CategoryPickerCommonProps &
  (SingleSelectionProps | MultipleSelectionProps);

/** Searchable native category selector with two-level expandable groups. */
export function CategoryPicker(props: Readonly<CategoryPickerProps>) {
  const {
    categories,
    recentCategoryIds = [],
    placeholder = 'Choose category',
    allowClear = false,
    clearLabel = 'Uncategorised',
    style,
    bottomSheetStyle,
    textStyle,
    categoryRowStyle,
    onCancel,
  } = props;
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [isPresented, setIsPresented] = useState(false);
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const skipDismissCallback = useRef(false);

  const tree = useMemo(
    () => buildCategoryPickerTree(categories, query),
    [categories, query],
  );
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  const selectedIds =
    props.selectionMode === 'multiple'
      ? (props.value ?? [])
      : props.value
        ? [props.value]
        : [];
  const selectedCategory = selectedIds
    .map((id) => categoriesById.get(id))
    .filter(
      (category): category is CategoryPickerItem => category !== undefined,
    );
  const triggerLabel = selectedCategory.length
    ? selectedCategory.map((category) => category.name).join(', ')
    : placeholder;
  const recents = recentCategoryIds
    .map((id) => categoriesById.get(id))
    .filter(
      (category): category is CategoryPickerItem => category !== undefined,
    );

  function openSheet() {
    setQuery('');
    setDraftIds(selectedIds);
    setExpandedIds([]);
    setIsPresented(true);
  }

  function closeSheet() {
    skipDismissCallback.current = true;
    setIsPresented(false);
  }

  function handleDismiss() {
    setIsPresented(false);
    if (skipDismissCallback.current) {
      skipDismissCallback.current = false;
      return;
    }
    onCancel?.();
  }

  function toggleSelection(id: string) {
    if (props.selectionMode === 'single') {
      props.onChange(id);
      closeSheet();
      return;
    }
    setDraftIds((current) => toggleCategorySelection(current, id));
  }

  function toggleExpanded(id: string) {
    setExpandedIds((current) => toggleCategorySelection(current, id));
  }

  function confirmMultipleSelection() {
    if (props.selectionMode !== 'multiple') return;
    props.onConfirm(draftIds);
    closeSheet();
  }

  function cancelSelection() {
    onCancel?.();
    closeSheet();
  }

  return (
    <>
      <Pressable
        accessibilityLabel={triggerLabel}
        accessibilityRole="button"
        onPress={openSheet}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.surface.background.primary,
            borderColor: colors.surface.border.primary,
            borderRadius: borderRadius.md,
            minHeight: 52,
            opacity: pressed ? 0.72 : 1,
            paddingHorizontal: spacing.md,
          },
          style,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.triggerText,
            {
              color: selectedCategory.length
                ? colors.text.primary
                : colors.text.placeholder,
              fontSize: typography.sizes.md,
            },
            textStyle,
          ]}
        >
          {triggerLabel}
        </Text>
        <IconChevronDown color={colors.text.secondary} size={18} />
      </Pressable>

      <BottomSheet
        containerColor={colors.surface.background.primary}
        contentPadding={0}
        isPresented={isPresented}
        onDismiss={handleDismiss}
        snapPoints={['full']}
        testID="category-picker-sheet"
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface.background.primary,
              padding: spacing.lg,
            },
            bottomSheetStyle,
          ]}
        >
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.xl,
              fontWeight: '700',
              marginBottom: spacing.md,
            }}
          >
            Choose category
          </Text>

          <View
            style={[
              styles.search,
              {
                backgroundColor: colors.surface.background.input,
                borderColor: colors.surface.border.input,
                borderRadius: borderRadius.md,
                marginBottom: spacing.md,
                paddingHorizontal: spacing.md,
              },
            ]}
          >
            <IconSearch color={colors.text.secondary} size={18} />
            <TextInput
              accessibilityLabel="Search categories"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder="Search categories"
              placeholderTextColor={colors.text.placeholder}
              style={{
                color: colors.text.primary,
                flex: 1,
                fontSize: typography.sizes.md,
                paddingVertical: spacing.sm,
              }}
              value={query}
            />
          </View>

          {!query.trim() && recents.length > 0 && (
            <View style={{ marginBottom: spacing.md }}>
              <SectionLabel>Recent</SectionLabel>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.sm }}
              >
                {recents.map((category) => (
                  <RecentCategory
                    key={category.id}
                    category={category}
                    onPress={() => toggleSelection(category.id)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          <SectionLabel>Categories</SectionLabel>
          <ScrollView
            contentContainerStyle={{
              gap: spacing.xs,
              paddingBottom: spacing.md,
            }}
            showsVerticalScrollIndicator={false}
            style={styles.categoryList}
          >
            {props.selectionMode === 'single' && allowClear && (
              <Pressable
                accessibilityRole="radio"
                accessibilityLabel={clearLabel}
                accessibilityState={{ checked: props.value === null }}
                onPress={() => {
                  props.onChange(null);
                  closeSheet();
                }}
                style={({ pressed }) => [
                  styles.clearRow,
                  {
                    borderColor: colors.surface.border.primary,
                    borderRadius: borderRadius.md,
                    opacity: pressed ? 0.72 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: typography.sizes.md,
                  }}
                >
                  {clearLabel}
                </Text>
                <SelectionMark selected={props.value === null} />
              </Pressable>
            )}
            {tree.map(({ category, children }) => {
              const expanded = query.trim()
                ? true
                : expandedIds.includes(category.id);
              return (
                <View key={category.id}>
                  <CategoryRow
                    category={category}
                    expanded={expanded}
                    hasChildren={children.length > 0}
                    onExpand={() => toggleExpanded(category.id)}
                    onSelect={() => toggleSelection(category.id)}
                    selected={selectionIncludes(category.id)}
                    rowStyle={categoryRowStyle}
                  />
                  {expanded &&
                    children.map((child) => (
                      <CategoryRow
                        key={child.id}
                        category={child}
                        indented
                        onSelect={() => toggleSelection(child.id)}
                        selected={selectionIncludes(child.id)}
                        rowStyle={categoryRowStyle}
                      />
                    ))}
                </View>
              );
            })}
            {tree.length === 0 && (
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.sizes.sm,
                  paddingVertical: spacing.md,
                }}
              >
                No categories found.
              </Text>
            )}
          </ScrollView>

          {props.selectionMode === 'multiple' && (
            <View
              style={[
                styles.actions,
                { gap: spacing.sm, marginTop: spacing.sm },
              ]}
            >
              <ActionButton
                label="Cancel"
                onPress={cancelSelection}
                secondary
              />
              <ActionButton
                label="Done"
                onPress={confirmMultipleSelection}
                secondary={false}
              />
            </View>
          )}
        </View>
      </BottomSheet>
    </>
  );

  function selectionIncludes(id: string) {
    return props.selectionMode === 'single'
      ? props.value === id
      : draftIds.includes(id);
  }

  function SectionLabel({ children }: Readonly<{ children: string }>) {
    return (
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: typography.sizes.xs,
          fontWeight: '700',
          letterSpacing: 0.7,
          marginBottom: spacing.xs,
          textTransform: 'uppercase',
        }}
      >
        {children}
      </Text>
    );
  }

  function RecentCategory({
    category,
    onPress,
  }: Readonly<{ category: CategoryPickerItem; onPress: () => void }>) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Select ${category.name}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.recent,
          {
            borderColor: colors.surface.border.primary,
            borderRadius: borderRadius.md,
            opacity: pressed ? 0.72 : 1,
            padding: spacing.sm,
          },
        ]}
      >
        <CategoryIcon
          name={category.icon}
          color={colors.text.primary}
          size={20}
        />
        <Text
          numberOfLines={1}
          style={{ color: colors.text.primary, fontSize: typography.sizes.sm }}
        >
          {category.name}
        </Text>
      </Pressable>
    );
  }

  function CategoryRow({
    category,
    selected,
    onSelect,
    hasChildren = false,
    expanded = false,
    onExpand,
    indented = false,
    rowStyle,
  }: Readonly<{
    category: CategoryPickerItem;
    selected: boolean;
    onSelect: () => void;
    hasChildren?: boolean;
    expanded?: boolean;
    onExpand?: () => void;
    indented?: boolean;
    rowStyle?: StyleProp<ViewStyle>;
  }>) {
    return (
      <View
        style={[
          styles.row,
          {
            backgroundColor: selected
              ? colors.button.secondary.default
              : colors.surface.background.primary,
            borderColor: selected
              ? colors.accent.primary
              : colors.surface.border.primary,
            borderRadius: borderRadius.md,
            marginLeft: indented ? spacing.lg : 0,
            minHeight: 54,
            paddingLeft: spacing.sm,
          },
          rowStyle,
        ]}
      >
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel={category.name}
          accessibilityState={{ checked: selected }}
          onPress={onSelect}
          style={({ pressed }) => [
            styles.rowSelect,
            { opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <View
            style={[
              styles.iconBubble,
              {
                backgroundColor:
                  category.colour || colors.button.secondary.default,
                borderRadius: borderRadius.lg,
              },
            ]}
          >
            <CategoryIcon
              name={category.icon}
              color={colors.text.primary}
              size={18}
            />
          </View>
          <Text
            numberOfLines={1}
            style={{
              color: colors.text.primary,
              flex: 1,
              fontSize: typography.sizes.md,
            }}
          >
            {category.name}
          </Text>
          <SelectionMark selected={selected} />
        </Pressable>
        {hasChildren && onExpand && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} ${category.name}`}
            accessibilityState={{ expanded }}
            hitSlop={6}
            onPress={onExpand}
            style={styles.expandButton}
          >
            {expanded ? (
              <IconChevronDown color={colors.text.secondary} size={18} />
            ) : (
              <IconChevronRight color={colors.text.secondary} size={18} />
            )}
          </Pressable>
        )}
      </View>
    );
  }

  function SelectionMark({ selected }: Readonly<{ selected: boolean }>) {
    return (
      <View
        accessibilityElementsHidden
        style={[
          styles.selectionMark,
          {
            backgroundColor: selected
              ? colors.accent.primary
              : colors.surface.background.primary,
            borderColor: selected
              ? colors.accent.primary
              : colors.surface.border.primary,
            borderRadius: borderRadius.lg,
          },
        ]}
      >
        {selected && (
          <Text
            style={{
              color: colors.button.onPrimary.default,
              fontSize: typography.sizes.xs,
              fontWeight: '700',
            }}
          >
            ✓
          </Text>
        )}
      </View>
    );
  }

  function ActionButton({
    label,
    onPress,
    secondary,
  }: Readonly<{ label: string; onPress: () => void; secondary: boolean }>) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.action,
          {
            backgroundColor: secondary
              ? colors.surface.background.primary
              : colors.accent.primary,
            borderColor: secondary
              ? colors.surface.border.primary
              : colors.accent.primary,
            borderRadius: borderRadius.md,
            opacity: pressed ? 0.72 : 1,
          },
        ]}
      >
        <Text
          style={{
            color: secondary
              ? colors.text.primary
              : colors.button.onPrimary.default,
            fontSize: typography.sizes.md,
            fontWeight: '600',
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
  },
  triggerText: {
    flex: 1,
  },
  sheet: {
    flex: 1,
  },
  search: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 52,
  },
  categoryList: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  rowSelect: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 52,
  },
  iconBubble: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  selectionMark: {
    alignItems: 'center',
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  expandButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    width: 42,
  },
  recent: {
    alignItems: 'center',
    borderWidth: 1,
    gap: 6,
    minWidth: 84,
  },
  clearRow: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: 12,
  },
  actions: {
    flexDirection: 'row',
  },
  action: {
    alignItems: 'center',
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
  },
});
