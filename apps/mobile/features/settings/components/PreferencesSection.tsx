import type { DateFormat } from '@guallet/api-client';
import { useUserSettingsMutations } from '@guallet/api-react';
import { CurrencyPicker, useTheme } from '@guallet/luna-mobile';
import { Alert, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SelectionSheet } from '@/components/ui/SelectionSheet';
import { availableCurrencies } from '@/components/currencyPickerData';
import { SettingsRow } from './SettingsRow';
import { SettingsSection } from './SettingsSection';
import { useMobileUserPreferences } from '../useMobileUserPreferences';
import { changeAppLanguage, getCurrentAppLanguage } from '@/i18n/i18n';
import { supportedLanguages, type AppLanguage } from '@/i18n/resources';

const dateFormatOptions: DateFormat[] = [
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'YYYY/MM/DD',
];

export function PreferencesSection() {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const { defaultCurrency, preferredCurrencies, dateFormat } =
    useMobileUserPreferences();
  const { updateUserSettingsMutation } = useUserSettingsMutations();
  const [isDateFormatPickerVisible, setIsDateFormatPickerVisible] =
    useState(false);
  const [isLanguagePickerVisible, setIsLanguagePickerVisible] = useState(false);
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);
  const language = getCurrentAppLanguage();

  async function saveLanguage(value: string | null) {
    if (!value || !supportedLanguages.includes(value as AppLanguage)) return;

    setIsSavingLanguage(true);
    try {
      await changeAppLanguage(value as AppLanguage);
      setIsLanguagePickerVisible(false);
    } catch {
      Alert.alert(t('settings.languageSaveError'), t('settings.retryMessage'));
    } finally {
      setIsSavingLanguage(false);
    }
  }

  async function saveDefaultCurrency(currencyCode: string) {
    try {
      await updateUserSettingsMutation.mutateAsync({
        currencies: { default_currency: currencyCode },
      });
    } catch {
      Alert.alert(
        t('settings.updateCurrencyError'),
        t('settings.retryMessage'),
      );
    }
  }

  async function savePreferredCurrencies(currencyCodes: string[]) {
    try {
      await updateUserSettingsMutation.mutateAsync({
        currencies: { preferred_currencies: currencyCodes },
      });
    } catch {
      Alert.alert(
        t('settings.updatePreferredCurrenciesError'),
        t('settings.retryMessage'),
      );
    }
  }

  async function saveDateFormat(value: string | null) {
    if (!value || !dateFormatOptions.includes(value as DateFormat)) return;

    try {
      await updateUserSettingsMutation.mutateAsync({
        date_format: value as DateFormat,
      });
      setIsDateFormatPickerVisible(false);
    } catch {
      Alert.alert(
        t('settings.updateDateFormatError'),
        t('settings.retryMessage'),
      );
    }
  }

  return (
    <View style={{ gap: spacing.lg }}>
      <SettingsSection title={t('settings.preferences')}>
        <SettingsRow
          disabled={isSavingLanguage}
          icon={
            <IconSymbol color={colors.accent.primary} name="globe" size={21} />
          }
          isLoading={isSavingLanguage}
          label={t('settings.language')}
          onPress={() => setIsLanguagePickerVisible(true)}
          value={t(`settings.languages.${language}`)}
        />
        <CurrencyPicker
          selectionMode="single"
          value={defaultCurrency}
          currencies={availableCurrencies}
          preferredCurrencyCodes={preferredCurrencies}
          showDefaultCurrency={false}
          onChange={(code) => void saveDefaultCurrency(code)}
          title={t('settings.defaultCurrency')}
          disabled={updateUserSettingsMutation.isPending}
          renderTrigger={({ open }) => (
            <SettingsRow
              disabled={updateUserSettingsMutation.isPending}
              icon={
                <IconSymbol
                  color={colors.accent.primary}
                  name="dollarsign.circle.fill"
                  size={21}
                />
              }
              isLoading={updateUserSettingsMutation.isPending}
              label={t('settings.defaultCurrency')}
              onPress={open}
              value={defaultCurrency}
            />
          )}
        />
        <CurrencyPicker
          selectionMode="multiple"
          value={preferredCurrencies}
          currencies={availableCurrencies}
          defaultCurrencyCode={defaultCurrency}
          showPreferredCurrencies={false}
          onConfirm={(codes) => void savePreferredCurrencies(codes)}
          title={t('settings.preferredCurrencies')}
          disabled={updateUserSettingsMutation.isPending}
          renderTrigger={({ open }) => (
            <SettingsRow
              disabled={updateUserSettingsMutation.isPending}
              icon={
                <IconSymbol
                  color={colors.accent.primary}
                  name="banknote.fill"
                  size={21}
                />
              }
              isLoading={updateUserSettingsMutation.isPending}
              label={t('settings.preferredCurrencies')}
              onPress={open}
              value={t('settings.currency', {
                count: preferredCurrencies.length,
              })}
            />
          )}
        />
        <SettingsRow
          disabled={updateUserSettingsMutation.isPending}
          icon={
            <IconSymbol
              color={colors.accent.primary}
              name="calendar"
              size={21}
            />
          }
          isLoading={updateUserSettingsMutation.isPending}
          label={t('settings.dateFormat')}
          onPress={() => setIsDateFormatPickerVisible(true)}
          value={dateFormat}
        />
      </SettingsSection>

      <SelectionSheet
        onClose={() => setIsDateFormatPickerVisible(false)}
        onSelect={(value) => void saveDateFormat(value)}
        options={dateFormatOptions.map((format) => ({
          id: format,
          label: format,
        }))}
        selectedId={dateFormat}
        title={t('settings.dateFormat')}
        visible={isDateFormatPickerVisible}
      />

      <SelectionSheet
        onClose={() => setIsLanguagePickerVisible(false)}
        onSelect={(value) => void saveLanguage(value)}
        options={supportedLanguages.map((code) => ({
          id: code,
          label: t(`settings.languages.${code}`),
        }))}
        selectedId={language}
        title={t('settings.languageTitle')}
        visible={isLanguagePickerVisible}
      />
    </View>
  );
}
