import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/chat/groups/$groupId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/chat/groups/$groupId"!</div>
}
