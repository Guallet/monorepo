import { useEffect, useRef, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation, usePreventRemove } from 'expo-router/react-navigation';
import type { InstitutionDto } from '@guallet/api-client';
import { useInstitution, useInstitutionMutations } from '@guallet/api-react';
import {
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
  institutionRequest,
  validateInstitutionForm,
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
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<{ name?: string; imageUrl?: string }>(
    {},
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showCountry, setShowCountry] = useState(false);
  const [completedId, setCompletedId] = useState<string | null>(null);
  const submission = useRef(false);
  const pending =
    createInstitutionMutation.isPending || updateInstitutionMutation.isPending;
  const dirty =
    form.name !== initial.name ||
    form.imageUrl !== initial.imageUrl ||
    form.country !== initial.country;
  usePreventRemove(!completedId && (dirty || pending), ({ data }) => {
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
    if (completedId) router.dismissTo(`/institutions/${completedId}`);
  }, [completedId, router]);
  function update(values: Partial<InstitutionForm>) {
    setForm((current) => ({ ...current, ...values }));
    setSaveError(null);
    setErrors({});
  }
  async function save() {
    if (submission.current) return;
    const validation = validateInstitutionForm(form);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    submission.current = true;
    Keyboard.dismiss();
    setSaveError(null);
    try {
      const request = institutionRequest(form);
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
            name: form.name.trim(),
            image_src: form.imageUrl.trim() || undefined,
            country: request.country,
          },
        });
        toast.success('Institution created');
      }
      setCompletedId(result.id);
    } catch (error) {
      setSaveError(institutionError(error, 'save'));
    } finally {
      submission.current = false;
    }
  }
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
  if (form.country) countryValue = countryName(form.country);
  if (pending) saveLabel = 'Saving…';
  return (
    <AppScreen headerTitle={title} safeAreaEdges={['left', 'right', 'bottom']}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
      >
        <InstitutionText secondary>{subtitle}</InstitutionText>
        <InstitutionCard>
          <View style={[institutionStyles.row, { gap: spacing.md }]}>
            <InstitutionLogo name={form.name} imageUrl={form.imageUrl.trim()} />
            <View style={institutionStyles.copy}>
              <InstitutionText heading>
                {form.name.trim() || 'Institution preview'}
              </InstitutionText>
              <InstitutionText secondary>
                Initials shown when no logo is available
              </InstitutionText>
            </View>
          </View>
        </InstitutionCard>
        <TextInput
          label="Institution name"
          accessibilityLabel="Institution name, required"
          accessibilityHint={errors.name}
          description="Use a name you will recognise."
          placeholder="e.g. Workplace pension"
          value={form.name}
          onChangeText={(name) => update({ name })}
          error={errors.name}
          disabled={pending}
          autoCapitalize="words"
        />
        <InstitutionText>{countryLabel}</InstitutionText>
        <InstitutionButton
          variant="outline"
          accessibilityLabel={`${countryLabel}: ${countryValue}`}
          disabled={pending}
          onClick={() => {
            Keyboard.dismiss();
            setShowCountry(true);
          }}
        >
          {countryValue}
        </InstitutionButton>
        <InstitutionText secondary>{countryHint}</InstitutionText>
        <TextInput
          label="Logo URL (optional)"
          accessibilityLabel="Logo URL, optional"
          accessibilityHint={errors.imageUrl}
          description="Paste an image link, or leave this blank."
          placeholder="https://example.com/logo.png"
          value={form.imageUrl}
          onChangeText={(imageUrl) => update({ imageUrl })}
          error={errors.imageUrl}
          disabled={pending}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {saveError && <InstitutionText error>{saveError}</InstitutionText>}
        <View
          accessibilityState={{ busy: pending }}
          style={{ gap: spacing.md }}
        >
          <InstitutionButton disabled={pending} onClick={() => void save()}>
            {saveLabel}
          </InstitutionButton>
          <InstitutionButton
            variant="subtle"
            disabled={pending}
            onClick={() => router.back()}
          >
            Cancel
          </InstitutionButton>
        </View>
      </KeyboardAwareScrollView>
      <CountrySheet
        open={showCountry}
        value={form.country}
        onSelect={(country) => update({ country })}
        onClose={() => setShowCountry(false)}
      />
    </AppScreen>
  );
}
