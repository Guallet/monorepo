import { useEffect, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation, usePreventRemove } from 'expo-router/react-navigation';
import { revalidateLogic, useSelector } from '@tanstack/react-form';
import type { InstitutionDto } from '@guallet/api-client';
import { useInstitution, useInstitutionMutations } from '@guallet/api-react';
import {
  KeyboardAwareScrollView,
  useAlert,
  useTheme,
  useToast,
} from '@guallet/luna-mobile';
import { AppScreen } from '@/components/layout/AppScreen';
import { submitForm, useAppForm } from '@/components/forms';
import {
  countriesLabel,
  countryName,
  institutionFormSchema,
  institutionRequest,
  type InstitutionForm,
} from '../institutions';
import { institutionError } from '../institutionError';
import {
  InstitutionCard,
  InstitutionLogo,
  InstitutionState,
  InstitutionButton,
  InstitutionText,
  institutionStyles,
} from '../components/InstitutionUi';
import { CountrySheet } from '../components/CountrySheet';

export default function InstitutionFormScreen({
  institutionId,
}: Readonly<{ institutionId?: string }>) {
  const query = useInstitution(institutionId);
  const { spacing } = useTheme();
  if (institutionId && !query.institution) {
    let title = 'Institution unavailable';
    if (query.isLoading) title = 'Loading institution…';
    if (query.isError) title = 'Couldn’t load institution';
    return (
      <AppScreen
        headerTitle="Edit institution"
        safeAreaEdges={['left', 'right', 'bottom']}
      >
        <View style={{ padding: spacing.md }}>
          <InstitutionState
            title={title}
            loading={query.isLoading}
            action="Try again"
            onAction={() => void query.refetch()}
          />
        </View>
      </AppScreen>
    );
  }
  if (institutionId && typeof query.institution?.user_id !== 'string')
    return (
      <AppScreen
        headerTitle="Institution"
        safeAreaEdges={['left', 'right', 'bottom']}
      >
        <View style={{ padding: spacing.md }}>
          <InstitutionState
            title="Shared institution"
            body="Shared institution details cannot be edited."
          />
        </View>
      </AppScreen>
    );
  return (
    <InstitutionFormContent
      key={institutionId ?? 'new'}
      institution={query.institution ?? undefined}
    />
  );
}

function InstitutionFormContent({
  institution,
}: Readonly<{ institution?: InstitutionDto }>) {
  const router = useRouter();
  const navigation = useNavigation();
  const showAlert = useAlert();
  const toast = useToast();
  const { spacing } = useTheme();
  const { createInstitutionMutation, updateInstitutionMutation } =
    useInstitutionMutations();
  const [initial] = useState<InstitutionForm>({
    name: institution?.name ?? '',
    imageUrl: institution?.image_src ?? '',
    country: '',
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [completedId, setCompletedId] = useState<string | null>(null);
  const form = useAppForm({
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
  usePreventRemove(!completedId && (dirty || pending), ({ data }) => {
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
      <form.AppForm>
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
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Institution name"
                accessibilityLabel="Institution name, required"
                description="Use a name you will recognise."
                placeholder="e.g. Workplace pension"
                disabled={pending}
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          </form.AppField>
          <InstitutionText>{countryLabel}</InstitutionText>
          <form.AppField name="country">
            {(field) => (
              <field.SelectField
                label={countryLabel}
                placeholder={countryValue}
                formatValue={countryName}
                disabled={pending}
                onOpen={Keyboard.dismiss}
                renderPicker={({ open, value, onClose, onSelect }) => (
                  <CountrySheet
                    open={open}
                    value={value}
                    onSelect={onSelect}
                    onClose={onClose}
                  />
                )}
              />
            )}
          </form.AppField>
          <InstitutionText secondary>{countryHint}</InstitutionText>
          <form.AppField name="imageUrl">
            {(field) => (
              <field.TextField
                label="Logo URL (optional)"
                accessibilityLabel="Logo URL, optional"
                description="Paste an image link, or leave this blank."
                placeholder="https://example.com/logo.png"
                disabled={pending}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => void submitForm(form)}
              />
            )}
          </form.AppField>
          {saveError && <InstitutionText error>{saveError}</InstitutionText>}
          <View
            accessibilityState={{ busy: pending }}
            style={{ gap: spacing.md }}
          >
            <form.SubmitButton
              submittingLabel="Saving…"
              disabled={pending}
              style={{ minHeight: 44, paddingVertical: spacing.md }}
            >
              {saveLabel}
            </form.SubmitButton>
            <InstitutionButton
              variant="subtle"
              disabled={pending}
              onClick={() => router.back()}
            >
              Cancel
            </InstitutionButton>
          </View>
        </KeyboardAwareScrollView>
      </form.AppForm>
    </AppScreen>
  );
}
