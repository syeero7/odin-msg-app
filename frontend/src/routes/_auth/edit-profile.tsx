import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/edit-profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/edit-profile"!</div>
}
