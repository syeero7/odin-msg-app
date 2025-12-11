import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/groups/$groupId/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return <main></main>;
}
