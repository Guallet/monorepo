import { Stack } from 'expo-router';
import { CategoryFeedbackProvider } from '@/features/categories/CategoryFeedback';

export default function CategoriesLayout() {
  return (
    <CategoryFeedbackProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </CategoryFeedbackProvider>
  );
}
