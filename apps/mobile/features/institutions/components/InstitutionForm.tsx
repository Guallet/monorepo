import { useEffect, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation, usePreventRemove } from 'expo-router/react-navigation';
import { revalidateLogic, useForm, useSelector } from '@tanstack/react-form';
import type { InstitutionDto } from '@guallet/api-client';
import { useInstitutionMutations } from '@guallet/api-react';
import {
  Button,
  KeyboardAwareScrollView,
  TextInput,
  useAlert,
  useTheme,
  useToast,
} from '@guallet/luna-mobile';
import { AppScreen } from '@/components/layout/AppScreen';
import {
  countriesLabel,
  countryName,
  institutionFormSchema,
  institutionRequest,
  type InstitutionForm as InstitutionFormValues,
} from '../institutions';
import { institutionError } from '../institutionError';
import {
  InstitutionCard,
  InstitutionLogo,
  InstitutionButton,
  InstitutionText,
  institutionStyles,
} from './InstitutionUi';
import { CountrySheet } from './CountrySheet';

export function InstitutionForm({
  institution,
}: Readonly<{ institution?: InstitutionDto }>) {
  const router = useRouter();
  const navigation = useNavigation();
  const showAlert = useAlert();
  const toast = useToast();
  const { spacing } = useTheme();
  const { createInstitutionMutation, updateInstitutionMutation } =
    useInstitutionMutations();
  const [initial] = useState<InstitutionFormValues>({
    name: institution?.name ?? '',
    imageUrl: institution?.image_src ?? '',
    country: '',
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [completedId, setCompletedId] = useState<string | null>(null);
  const [showCountrySheet, setShowCountrySheet] = useState(false);
  const form = useForm({
    defaultValues: initial,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: institutionFormSchema },
    listeners: { onChange: () => setSaveError(null) },
    onSubmit: async ({ value }) => {
      Keyboard.dismiss();
      setSaveError(null);
      try {
        const request = institutionRequest(value);
        let result: InstitutionDto;
        if (institution) {
          result = await updateInstitutionMutation.mutateAsync({
            id: institution.id,
            request,
          });
          toast.success('Institution updated');
        } else {
          result = await createInstitutionMutation.mutateAsync({
            request: {
              name: value.name.trim(),
              image_src: value.imageUrl.trim() || undefined,
              country: request.country,
            },
          });
          toast.success('Institution created');
        }
        setCompletedId(result.id);
      } catch (error) {
        setSaveError(institutionError(error, 'save'));
      }
    },
  });
  const name = useSelector(form.store, (state) => state.values.name);
  const imageUrl = useSelector(form.store, (state) => state.values.imageUrl);
  const country = useSelector(form.store, (state) => state.values.country);
  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);
  const pending =
    isSubmitting ||
    createInstitutionMutation.isPending ||
    updateInstitutionMutation.isPending;
  const dirty =
    name.trim() !== initial.name.trim() ||
    imageUrl.trim() !== initial.imageUrl.trim() ||
    country !== initial.country;
  async function submitForm() {
    if (form.state.isSubmitting) return;
    await form.handleSubmit();
  }
  usePreventRemove(!completedId && (dirty || pending), ({ data }) => {
    if (pending) return;
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
    if (completedId) router.dismissTo(`/institutions/${completedId}`);
  }, [completedId, router]);
  let title = 'Create institution';
  let subtitle = 'Add a bank, provider or personal wallet';
  let countryLabel = 'Country (optional)';
  let countryValue = 'Choose a country';
  let countryHint = 'Choose where this institution is based.';
  let saveLabel = 'Create institution';
  if (institution) {
    title = 'Edit institution';
    subtitle = 'Update the details for this institution';
    saveLabel = 'Save changes';
    countryLabel = 'Add country (optional)';
    countryValue = 'Choose an additional country';
    countryHint = `Current: ${countriesLabel(institution.countries)}. Existing countries stay.`;
  }
  return (
    <AppScreen headerTitle={title} safeAreaEdges={['left', 'right', 'bottom']}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
      >
        <InstitutionText secondary>{subtitle}</InstitutionText>
        <InstitutionCard>
          <View style={[institutionStyles.row, { gap: spacing.md }]}>
            <InstitutionLogo name={name} imageUrl={imageUrl.trim()} />
            <View style={institutionStyles.copy}>
              <InstitutionText heading>
                {name.trim() || 'Institution preview'}
              </InstitutionText>
              <InstitutionText secondary>
                Initials shown when no logo is available
              </InstitutionText>
            </View>
          </View>
        </InstitutionCard>
        <form.Field name="name">
          {(field) => {
            const error = field.state.meta.errors[0]?.message;
            return (
              <TextInput
                label="Institution name"
                accessibilityLabel="Institution name, required"
                accessibilityHint={error ?? 'Use a name you will recognise.'}
                description="Use a name you will recognise."
                placeholder="e.g. Workplace pension"
                disabled={pending}
                autoCapitalize="words"
                returnKeyType="next"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                error={error}
              />
            );
          }}
        </form.Field>
        <InstitutionText>{countryLabel}</InstitutionText>
        <form.Field name="country">
          {(field) => (
            <>
              <Button
                variant="outline"
                disabled={pending}
                accessibilityLabel={`${countryLabel}: ${field.state.value ? countryName(field.state.value) : countryValue}`}
                onClick={() => {
                  Keyboard.dismiss();
                  setShowCountrySheet(true);
                }}
              >
                {field.state.value
                  ? countryName(field.state.value)
                  : countryValue}
              </Button>
              <CountrySheet
                open={showCountrySheet}
                value={field.state.value}
                onSelect={(value) => {
                  field.handleChange(value);
                  field.handleBlur();
                  setShowCountrySheet(false);
                }}
                onClose={() => setShowCountrySheet(false)}
              />
            </>
          )}
        </form.Field>
        <InstitutionText secondary>{countryHint}</InstitutionText>
        <form.Field name="imageUrl">
          {(field) => {
            const error = field.state.meta.errors[0]?.message;
            return (
              <TextInput
                label="Logo URL (optional)"
                accessibilityLabel="Logo URL, optional"
                description="Paste an image link, or leave this blank."
                placeholder="https://example.com/logo.png"
                disabled={pending}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => void submitForm()}
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                error={error}
                accessibilityHint={
                  error ?? 'Paste an image link, or leave this blank.'
                }
              />
            );
          }}
        </form.Field>
        {saveError && <InstitutionText error>{saveError}</InstitutionText>}
        <View
          accessibilityState={{ busy: pending }}
          style={{ gap: spacing.md }}
        >
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                disabled={!canSubmit || pending || isSubmitting}
                onClick={() => void submitForm()}
                style={{ minHeight: 44, paddingVertical: spacing.md }}
              >
                {isSubmitting ? 'Saving…' : saveLabel}
              </Button>
            )}
          </form.Subscribe>
          <InstitutionButton
            variant="subtle"
            disabled={pending}
            onClick={() => router.back()}
          >
            Cancel
          </InstitutionButton>
        </View>
      </KeyboardAwareScrollView>
    </AppScreen>
  );
}
