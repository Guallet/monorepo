import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text as NativeText,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation, usePreventRemove } from 'expo-router/react-navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '@guallet/api-client';
import { useCategories, useCategoryMutations } from '@guallet/api-react';
import {
  BottomSheet,
  Button,
  ColorPicker,
  IconPicker,
  TextInput,
  useAlert,
  useTheme,
} from '@guallet/luna-mobile';
import { CategoryIcon, DeleteIcon } from '@guallet/luna-mobile/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { CategoryPicker } from '@/components/category-picker/CategoryPicker';
import {
  categoryForm,
  categoryFormChanged,
  eligibleCategoryParents,
  type CategoryForm,
} from '../categoryForm';
import {
  CategoryCard,
  CategoryState,
  CategoryText,
} from '../components/CategoryUi';

export default function CategoryFormScreen({
  categoryId,
  initialParentId,
}: Readonly<{ categoryId?: string; initialParentId?: string }>) {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const showAlert = useAlert();
  const { categories, isLoading, isError, refetch } = useCategories();
  const {
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  } = useCategoryMutations();
  const category = categories.find((item) => item.id === categoryId);
  const defaults: CategoryForm = {
    name: '',
    parentId: initialParentId ?? null,
    icon: 'IconTag',
    colour: colors.accent.primary,
  };
  const [form, setForm] = useState<CategoryForm>(defaults);
  const [initialForm, setInitialForm] = useState(defaults);
  const [initializedId, setInitializedId] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [completed, setCompleted] = useState(false);
  const submission = useRef(false);
  const pending =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    deleteCategoryMutation.isPending;
  let formPointerEvents: 'none' | 'auto' = 'auto';
  if (pending) formPointerEvents = 'none';
  const hasChildren =
    Boolean(categoryId) &&
    categories.some((item) => item.parentId === categoryId);
  const parents = eligibleCategoryParents(categories, categoryId);
  const dirty = categoryFormChanged(form, initialForm);
  const ready =
    !isLoading &&
    !isError &&
    (!categoryId || Boolean(category)) &&
    (!categoryId || initializedId === categoryId);
  let title = 'Create category';
  let saveLabel = 'Create category';
  if (categoryId) {
    title = 'Edit category';
    saveLabel = 'Save changes';
  }
  if (pending) saveLabel = 'Saving…';
  let deleteLabel = 'Delete category';
  if (deleteCategoryMutation.isPending) deleteLabel = 'Deleting…';
  let previewName = form.name.trim();
  if (!previewName) previewName = 'Category preview';
  let keyboardBehavior: 'padding' | 'height' = 'height';
  if (Platform.OS === 'ios') keyboardBehavior = 'padding';

  useEffect(() => {
    if (!category || initializedId === category.id) return;
    setInitializedId(category.id);
    const values = categoryForm(category);
    setInitialForm(values);
    setForm(values);
  }, [category, initializedId]);

  usePreventRemove(!completed && (dirty || pending), ({ data }) => {
    if (submission.current) return;
    showAlert({
      title: 'Discard changes?',
      message: 'Your unsaved changes will be lost.',
      actions: [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard changes',
          style: 'destructive',
          onPress: () => navigation.dispatch(data.action),
        },
      ],
    });
  });

  useEffect(() => {
    if (completed) router.back();
  }, [completed, router]);

  function update(values: Partial<CategoryForm>) {
    setForm((current) => ({ ...current, ...values }));
    setSaveError(null);
    if (values.name !== undefined) setNameError(null);
  }

  async function save() {
    if (submission.current || !ready) return;
    if (!form.name.trim()) {
      setNameError('Enter a category name');
      return;
    }
    submission.current = true;
    Keyboard.dismiss();
    setSaveError(null);
    const request = { ...form, name: form.name.trim() };
    try {
      if (categoryId) {
        await updateCategoryMutation.mutateAsync({
          id: categoryId,
          request,
        });
      } else {
        await createCategoryMutation.mutateAsync({ request });
      }
      setCompleted(true);
    } catch (error) {
      setSaveError(errorMessage(error, 'Couldn’t save category. Try again.'));
    } finally {
      submission.current = false;
    }
  }

  function closeDelete() {
    setShowDelete(false);
  }

  async function remove() {
    if (!categoryId || hasChildren || submission.current) return;
    submission.current = true;
    setDeleteError(null);
    try {
      await deleteCategoryMutation.mutateAsync({ id: categoryId });
      setShowDelete(false);
      setCompleted(true);
    } catch (error) {
      setShowDelete(true);
      setDeleteError(
        errorMessage(error, 'Couldn’t delete category. Try again.'),
      );
    } finally {
      submission.current = false;
    }
  }

  if (isLoading)
    return (
      <AppScreen headerTitle={title}>
        <View
          style={[styles.loading, { padding: spacing.lg }]}
          accessibilityState={{ busy: true }}
        >
          <ActivityIndicator color={colors.accent.primary} />
          <CategoryText>Loading categories…</CategoryText>
        </View>
      </AppScreen>
    );
  if (isError)
    return (
      <AppScreen headerTitle={title}>
        <View style={{ padding: spacing.md }}>
          <CategoryState
            title="Couldn’t load categories"
            action="Try again"
            onAction={() => void refetch()}
          />
        </View>
      </AppScreen>
    );
  if (categoryId && !category && !pending && !completed)
    return (
      <AppScreen headerTitle={title}>
        <View style={{ padding: spacing.md }}>
          <CategoryState
            title="Category not found"
            body="It may have been deleted."
            action="Back to categories"
            onAction={() => router.back()}
          />
        </View>
      </AppScreen>
    );

  return (
    <AppScreen
      headerTitle={title}
      headerOptions={{ headerBackTitle: 'Categories' }}
    >
      <KeyboardAvoidingView
        behavior={keyboardBehavior}
        style={styles.flex}
        keyboardVerticalOffset={insets.top + 44}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}
        >
          <CategoryCard>
            <View style={{ alignItems: 'center', gap: spacing.md }}>
              <CategoryIcon
                name={form.icon}
                color={form.colour || colors.accent.primary}
                size={spacing.xxl}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <CategoryText heading>{previewName}</CategoryText>
            </View>
          </CategoryCard>
          <View pointerEvents={formPointerEvents} style={{ gap: spacing.md }}>
            <TextInput
              label="Name"
              accessibilityLabel="Category name"
              accessibilityHint={nameError ?? undefined}
              disabled={pending}
              value={form.name}
              onChangeText={(name) => update({ name })}
              error={nameError}
              placeholder="e.g. Groceries"
              returnKeyType="done"
              onSubmitEditing={() => void save()}
            />
            <CategoryText>Parent category</CategoryText>
            {!hasChildren && (
              <CategoryPicker
                selectionMode="single"
                categories={parents}
                value={form.parentId}
                onChange={(parentId) => update({ parentId })}
                allowClear
                clearLabel="None"
                placeholder="None"
              />
            )}
            {hasChildren && (
              <CategoryText secondary>
                None — move the subcategories first to choose a parent.
              </CategoryText>
            )}
            {!hasChildren && (
              <CategoryText secondary>
                Choose None for a top-level category.
              </CategoryText>
            )}
            <CategoryText>Icon</CategoryText>
            <IconPicker
              value={form.icon}
              onChange={(icon) => update({ icon })}
            />
            <CategoryText>Colour</CategoryText>
            <ColorPicker
              value={form.colour}
              onChange={(colour) => update({ colour })}
              colors={[
                ...new Set(
                  [
                    colors.accent.primary,
                    colors.accent.bright,
                    colors.accent.aqua,
                    colors.support.primary,
                    colors.support.dark,
                    colors.neutral.darkGrey,
                    colors.neutral.midGrey,
                    form.colour,
                  ].filter(Boolean),
                ),
              ]}
            />
          </View>
          {categoryId && (
            <CategoryText secondary>
              Changes apply to existing transactions.
            </CategoryText>
          )}
          {saveError && <CategoryText error>{saveError}</CategoryText>}
        </ScrollView>
        <View
          style={{
            padding: spacing.md,
            paddingBottom: Math.max(insets.bottom, spacing.md),
            gap: spacing.sm,
            backgroundColor: colors.surface.background.primary,
          }}
        >
          <Button
            disabled={pending || !ready || Boolean(categoryId && !dirty)}
            onClick={() => void save()}
          >
            {saveLabel}
          </Button>
          {categoryId && (
            <Button
              variant="subtle"
              disabled={pending}
              onClick={() => {
                Keyboard.dismiss();
                setDeleteError(null);
                setShowDelete(true);
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}
              >
                <DeleteIcon
                  color={colors.status.error}
                  size={spacing.lg}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
                <NativeText style={{ color: colors.status.error }}>
                  Delete category
                </NativeText>
              </View>
            </Button>
          )}
        </View>
      </KeyboardAvoidingView>
      <BottomSheet
        isOpen={showDelete}
        title="Delete category?"
        showCloseIcon={!pending}
        onClose={closeDelete}
        onDismiss={closeDelete}
      >
        <ScrollView
          contentContainerStyle={{
            padding: spacing.md,
            gap: spacing.md,
            paddingBottom: Math.max(insets.bottom, spacing.md),
          }}
        >
          <View style={{ alignItems: 'center', gap: spacing.md }}>
            <CategoryIcon
              name={category?.icon}
              color={category?.colour || colors.accent.primary}
              size={spacing.xxl}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <CategoryText heading>{category?.name}</CategoryText>
          </View>
          {hasChildren && (
            <CategoryText>
              Move or delete the subcategories in this category first.
            </CategoryText>
          )}
          {!hasChildren && (
            <>
              <CategoryText>
                Transactions in this category will become uncategorised. Your
                transactions will be kept.
              </CategoryText>
              <CategoryText secondary>This cannot be undone.</CategoryText>
              {deleteError && <CategoryText error>{deleteError}</CategoryText>}
              <Button
                disabled={pending}
                onClick={() => void remove()}
                style={{ backgroundColor: colors.status.error }}
              >
                <View accessibilityState={{ busy: pending }}>
                  <DeleteButtonText label={deleteLabel} />
                </View>
              </Button>
            </>
          )}
          <Button variant="outline" disabled={pending} onClick={closeDelete}>
            Keep category
          </Button>
        </ScrollView>
      </BottomSheet>
    </AppScreen>
  );
}

function errorMessage(error: unknown, fallback: string): string {
  if (
    error instanceof ApiError &&
    (error.status === 400 || error.status === 404 || error.status === 409)
  )
    return error.message;
  return fallback;
}

function DeleteButtonText({ label }: Readonly<{ label: string }>) {
  const { colors, typography } = useTheme();
  return (
    <NativeText
      style={{
        color: colors.text.inverse,
        fontSize: typography.sizes.md,
        fontWeight: '600',
      }}
    >
      {label}
    </NativeText>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: { alignItems: 'center' },
});
