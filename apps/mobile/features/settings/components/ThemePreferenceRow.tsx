import { useState } from 'react';
import { useAlert, useTheme } from '@guallet/luna-mobile';
import { ThemeIcon } from '@guallet/luna-mobile/icons';
import { SelectionSheet } from '@/components/ui/SelectionSheet';
import { useThemePreference } from '../../../theme/AppThemeProvider';
import {
  isThemePreference,
  themeLabels,
  themePreferences,
} from '../../../theme/themePreference';
import { SettingsRow } from './SettingsRow';

const themeOptions = themePreferences.map((id) => ({
  id,
  label: themeLabels[id],
}));

/** Own the local theme picker, save feedback, and failure alert. */
export function ThemePreferenceRow() {
  const { colors } = useTheme();
  const showAlert = useAlert();
  const { preference, savePreference } = useThemePreference();
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /** The sheet closes immediately; a failed save preserves the previous theme. */
  async function saveTheme(value: string | null) {
    if (!isThemePreference(value) || isSaving) return;
    setIsSaving(true);
    try {
      await savePreference(value);
    } catch {
      showAlert({
        title: 'Couldn’t save theme',
        message: 'Please try again in a moment.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <SettingsRow
        disabled={isSaving}
        icon={
          <ThemeIcon
            color={colors.accent.primary}
            size={21}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        }
        isLoading={isSaving}
        label="Theme"
        onPress={() => setIsPickerVisible(true)}
        value={themeLabels[preference]}
      />
      <SelectionSheet
        onClose={() => setIsPickerVisible(false)}
        onSelect={(value) => void saveTheme(value)}
        options={themeOptions}
        selectedId={preference}
        title="Theme"
        visible={isPickerVisible}
      />
    </>
  );
}
