import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login/callback')({
  component: () => <div>Hello /_login/callback!</div>
})