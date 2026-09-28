import type { DateFormat } from '@guallet/api-client';
import { useUserSettingsMutations } from '@guallet/api-react';
import { CurrencyPicker, useTheme } from '@guallet/luna-mobile';
import { Alert, View } from 'react-native';
import { useState } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SelectionSheet } from '@/components/ui/SelectionSheet';
import { availableCurrencies } from '@/components/currencyPickerData';
import { SettingsRow } from './SettingsRow';
import { SettingsSection } from './SettingsSection';
import { useMobileUserPreferences } from '../useMobileUserPreferences';

const dateFormatOptions: DateFormat[] = [
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'YYYY/MM/DD',
];

export function PreferencesSection() {
  const { colors, spacing } = useTheme();
  const { defaultCurrency, preferredCurrencies, dateFormat } =
    useMobileUserPreferences();
  const { updateUserSettingsMutation } = useUserSettingsMutations();
  const [isDateFormatPickerVisible, setIsDateFormatPickerVisible] =
    useState(false);

  async function saveDefaultCurrency(currencyCode: string) {
    try {
      await updateUserSettingsMutation.mutateAsync({
        currencies: { default_currency: currencyCode },
      });
    } catch {
      Alert.alert('Couldn’t update currency', 'Please try again in a moment.');
    }
  }

  async function savePreferredCurrencies(currencyCodes: string[]) {
    try {
      await updateUserSettingsMutation.mutateAsync({
        currencies: { preferred_currencies: currencyCodes },
      });
    } catch {
      Alert.alert(
        'Couldn’t update preferred currencies',
        'Please try again in a moment.',
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
        'Couldn’t update date format',
        'Please try again in a moment.',
      );
    }
  }

  return (
    <View style={{ gap: spacing.lg }}>
      <SettingsSection title="Preferences">
        <CurrencyPicker
          selectionMode="single"
          value={defaultCurrency}
          currencies={availableCurrencies}
          preferredCurrencyCodes={preferredCurrencies}
          showDefaultCurrency={false}
          onChange={(code) => void saveDefaultCurrency(code)}
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
          onConfirm={(codes) => void savePreferredCurrencies(codes)}
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
