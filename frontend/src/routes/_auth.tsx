import { SocketProvider } from "@/components/SocketProvider";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: Authenticated,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.user) {
      throw redirect({
        to: "/login",
        viewTransition: true,
        replace: true,
        search: {
          redirect: location.href,
        },
      });
    }
  },
});

function Authenticated() {
  return (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  );
}
