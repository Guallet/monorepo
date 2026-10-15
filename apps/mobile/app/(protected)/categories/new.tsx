import { useLocalSearchParams } from 'expo-router';
import CategoryFormScreen from '@/features/categories/screens/CategoryFormScreen';

export default function NewCategoryRoute() {
  const { parent } = useLocalSearchParams<{ parent?: string }>();
  return <CategoryFormScreen initialParentId={parent} />;
}
