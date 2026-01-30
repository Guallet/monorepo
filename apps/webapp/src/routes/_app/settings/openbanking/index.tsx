import { NordigenCredentialsScreen } from '@/features/openbanking/nordigen/screens/NordigenCredentialsScreen'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/settings/openbanking/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <NordigenCredentialsScreen />
}
