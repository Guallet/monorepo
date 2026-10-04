import type { DateFormat } from '@guallet/api-client';
import { useUserSettingsMutations } from '@guallet/api-react';
import { CurrencyPicker, useAlert, useTheme } from '@guallet/luna-mobile';
import { View } from 'react-native';
import { useState } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SelectionSheet } from '@/components/ui/SelectionSheet';
import { availableCurrencies } from '@/components/currencyPickerData';
import { SettingsRow } from './SettingsRow';
import { SettingsSection } from './SettingsSection';
import { useMobileUserPreferences } from '../useMobileUserPreferences';
import { useThemePreference } from '../ThemePreferenceProvider';
import { ThemeIcon } from '@guallet/luna-mobile/icons';

const themeOptions = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

const dateFormatOptions: DateFormat[] = [
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'YYYY/MM/DD',
];

export function PreferencesSection() {
  const { colors, spacing } = useTheme();
  const showAlert = useAlert();
  const { preference, setPreference } = useThemePreference();
  const [isThemePickerVisible, setIsThemePickerVisible] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const { defaultCurrency, preferredCurrencies, dateFormat } =
    useMobileUserPreferences();
  const { updateUserSettingsMutation } = useUserSettingsMutations();
  const [isDateFormatPickerVisible, setIsDateFormatPickerVisible] =
    useState(false);

  async function saveTheme(value: string | null) {
    if (value !== 'system' && value !== 'light' && value !== 'dark') return;

    setIsSavingTheme(true);
    try {
      await setPreference(value);
    } catch {
      showAlert({
        title: 'Couldn’t save theme',
        message: 'Please try again in a moment.',
      });
    } finally {
      setIsSavingTheme(false);
    }
  }

  async function saveDefaultCurrency(currencyCode: string) {
    try {
      await updateUserSettingsMutation.mutateAsync({
        currencies: { default_currency: currencyCode },
      });
      return true;
    } catch {
      showAlert({
        title: 'Couldn’t update currency',
        message: 'Please try again in a moment.',
      });
      return false;
    }
  }

  async function savePreferredCurrencies(currencyCodes: string[]) {
    try {
      await updateUserSettingsMutation.mutateAsync({
        currencies: { preferred_currencies: currencyCodes },
      });
      return true;
    } catch {
      showAlert({
        title: 'Couldn’t update preferred currencies',
        message: 'Please try again in a moment.',
      });
      return false;
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
      showAlert({
        title: 'Couldn’t update date format',
        message: 'Please try again in a moment.',
      });
    }
  }

  return (
    <View style={{ gap: spacing.lg }}>
      <SettingsSection title="Preferences">
        <SettingsRow
          disabled={isSavingTheme}
          icon={<ThemeIcon color={colors.accent.primary} size={21} />}
          isLoading={isSavingTheme}
          label="Theme"
          onPress={() => setIsThemePickerVisible(true)}
          value={themeOptions.find((option) => option.id === preference)?.label}
        />
        <CurrencyPicker
          selectionMode="single"
          value={defaultCurrency}
          currencies={availableCurrencies}
          preferredCurrencyCodes={preferredCurrencies}
          showDefaultCurrency={false}
          onChange={saveDefaultCurrency}
          title="Default currency"
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
              label="Default currency"
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
          onConfirm={savePreferredCurrencies}
          title="Preferred currencies"
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
              label="Preferred currencies"
              onPress={open}
              value={`${preferredCurrencies.length} ${preferredCurrencies.length === 1 ? 'currency' : 'currencies'}`}
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
          label="Date format"
          onPress={() => setIsDateFormatPickerVisible(true)}
          value={dateFormat}
        />
      </SettingsSection>

      <SelectionSheet
        onClose={() => setIsThemePickerVisible(false)}
        onSelect={(value) => void saveTheme(value)}
        options={themeOptions}
        selectedId={preference}
        title="Theme"
        visible={isThemePickerVisible}
      />

      <SelectionSheet
        onClose={() => setIsDateFormatPickerVisible(false)}
        onSelect={(value) => void saveDateFormat(value)}
        options={dateFormatOptions.map((format) => ({
          id: format,
          label: format,
        }))}
        selectedId={dateFormat}
        title="Date format"
        visible={isDateFormatPickerVisible}
      />
    </View>
  );
}
