import { createLazyFileRoute } from '@tanstack/react-router';
import { LandingScreen } from '@/features/landing/screens/LandingScreen';

export const Route = createLazyFileRoute('/')({
  component: LandingScreen,
});
