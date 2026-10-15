import { createFileRoute } from '@tanstack/react-router';
import { RegisterScreen } from '@/features/auth/screens/RegisterScreen';

export const Route = createFileRoute('/register')({
  component: RouteComponent,
});

function RouteComponent() {
  return <RegisterScreen />;
}
