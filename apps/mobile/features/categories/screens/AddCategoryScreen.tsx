import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useCategoryMutations, useCategories } from '@guallet/api-react';
import { CreateCategoryRequest } from '@guallet/api-client';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  ListRow,
  Section,
  TextInput,
  useTheme,
} from '@luna-ui/react-native';
import { useRouter } from 'expo-router';

const PRESET_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
  '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
  '#F97316', '#06B6D4', '#84CC16', '#A855F7',
];

const PRESET_ICONS = [
  '🏠', '🚗', '🍔', '🛒', '💊', '🎮',
  '📚', '✈️', '💡', '🎵', '👕', '💰',
  '🏋️', '🐕', '🎁', '📱', '🏥', '🎬',
];

export function AddCategoryScreen() {
  const router = useRouter();
  const { createCategoryMutation } = useCategoryMutations();
  const { categories } = useCategories();
  const { spacing } = useTheme();

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📁');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const request: CreateCategoryRequest = {
        name: name.trim(),
        icon: selectedIcon,
        colour: selectedColor,
        parentId,
      };

      await createCategoryMutation.mutateAsync({ request });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppScreen headerTitle="Add Category">
        <ScrollView
          contentContainerStyle={{ padding: spacing.md, gap: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Section title="Category Details">
            <View style={styles.formContent}>
              <TextInput
                label="Category Name"
                placeholder="Enter category name"
                value={name}
                onChangeText={setName}
              />
            </View>
          </Section>

          <Section title="Icon">
            <View style={styles.pickerGrid}>
              {PRESET_ICONS.map((icon) => (
                <Button
                  key={icon}
                  variant={selectedIcon === icon ? 'filled' : 'subtle'}
                  onClick={() => setSelectedIcon(icon)}
                  style={styles.iconButton}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </Button>
              ))}
            </View>
          </Section>

          <Section title="Colour">
            <View style={styles.pickerGrid}>
              {PRESET_COLORS.map((color) => (
                <Button
                  key={color}
                  variant={selectedColor === color ? 'filled' : 'subtle'}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    ...styles.colorButton,
                    backgroundColor: color,
                    ...(selectedColor === color ? styles.selectedColor : {}),
                  }}
                >
                  {selectedColor === color ? (
                    <Text style={styles.colorCheck}>✓</Text>
                  ) : (
                    <Text>{' '}</Text>
                  )}
                </Button>
              ))}
            </View>
          </Section>

          <Section title="Parent Category (optional)">
            <ListRow
              title="No parent (top level)"
              onPress={() => setParentId(undefined)}
              right={
                parentId === undefined ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : null
              }
            />
            {categories
              .filter((c) => !c.parentId)
              .map((category) => (
                <ListRow
                  key={category.id}
                  title={category.name}
                  onPress={() => setParentId(category.id)}
                  right={
                    parentId === category.id ? (
                      <Text style={styles.checkmark}>✓</Text>
                    ) : null
                  }
                />
              ))}
          </Section>

          <View style={styles.actions}>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </View>
        </ScrollView>
      </AppScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    gap: 4,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 0,
  },
  iconText: {
    fontSize: 24,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 0,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#1F2937',
  },
  colorCheck: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  checkmark: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  actions: {
    gap: 12,
  },
});
