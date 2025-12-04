import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/")({
  component: () => <Navigate to="/groups" viewTransition replace />,
});
