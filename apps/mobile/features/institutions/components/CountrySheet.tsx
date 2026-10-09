import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { BottomSheet, TextInput, useTheme } from '@guallet/luna-mobile';
import { CheckIcon } from '@guallet/luna-mobile/icons';
import { countryOptions } from '../institutions';
import {
  InstitutionButton,
  InstitutionText,
  institutionStyles,
} from './InstitutionUi';

export function CountrySheet({
  open,
  value,
  onClose,
  onSelect,
}: Readonly<{
  open: boolean;
  value: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}>) {
  const { colors, spacing } = useTheme();
  const [search, setSearch] = useState('');
  const options = countryOptions.filter((option) =>
    `${option.id} ${option.label}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  function select(code: string) {
    onSelect(code);
    setSearch('');
    onClose();
  }
  return (
    <BottomSheet
      isOpen={open}
      title="Choose a country"
      snapPoints={['full']}
      showCloseIcon
      onClose={() => {
        setSearch('');
        onClose();
      }}
    >
      <View style={{ flex: 1, gap: spacing.sm }}>
        <TextInput
          accessibilityLabel="Search countries"
          placeholder="Search countries"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        <InstitutionButton variant="outline" onClick={() => select('')}>
          No country
        </InstitutionButton>
        <FlatList
          data={options}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <InstitutionText secondary>No matching countries</InstitutionText>
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: value === item.id }}
              accessibilityLabel={item.label}
              onPress={() => select(item.id)}
              style={[
                institutionStyles.target,
                institutionStyles.row,
                { paddingVertical: spacing.md, gap: spacing.sm },
              ]}
            >
              <View style={institutionStyles.copy}>
                <InstitutionText>{item.label}</InstitutionText>
              </View>
              {value === item.id && (
                <CheckIcon
                  size={24}
                  color={colors.accent.primary}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              )}
            </Pressable>
          )}
        />
      </View>
    </BottomSheet>
  );
}
