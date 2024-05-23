import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/categories/$id/edit')({
  component: () => <div>Hello /_app/categories/$id/edit!</div>
})