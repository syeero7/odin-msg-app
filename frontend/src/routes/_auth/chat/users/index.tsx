import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/chat/users/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/chat/users/"!</div>
}
