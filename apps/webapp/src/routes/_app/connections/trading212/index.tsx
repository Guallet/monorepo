import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/connections/trading212/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/connections/trading212/"!</div>
}
