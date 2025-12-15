import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools";

import type { QueryClient } from "@tanstack/react-query";
import type { AuthState } from "@/components/AuthProvider";
import GeneralError from "@/components/GeneralError";
import NotFoundError from "@/components/NotFoundError";
import { WithLoadingState } from "@/components/WithLoadingState";

interface MyRouterContext {
  queryClient: QueryClient;
  auth: AuthState;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <WithLoadingState>
        <Outlet />
      </WithLoadingState>
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </>
  ),
  errorComponent: GeneralError,
  notFoundComponent: NotFoundError,
});
