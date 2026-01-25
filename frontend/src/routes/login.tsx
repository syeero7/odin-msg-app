import { useEffect, type ReactElement, type ReactSVGElement } from "react";
import { useQuery } from "@tanstack/react-query";
import z from "zod";
import {
  createFileRoute,
  redirect,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { CURRENT_USER } from "@/lib/query-keys";
import { getUserData } from "@/lib/api";
import * as storage from "@/lib/storage";
import { cfg } from "@/lib/env";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  validateSearch: z.object({
    redirect: z.string().optional().catch("/"),
    token: z.string().optional(),
  }),
  beforeLoad: ({ search, context }) => {
    if (context.auth.user) {
      throw redirect({ to: search.redirect || "/" });
    }
    if (search.token) {
      storage.setItem(search.token);
    }
  },
});

function RouteComponent() {
  const { auth } = Route.useRouteContext();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { data, isSuccess, isError } = useQuery({
    queryKey: CURRENT_USER,
    enabled: !!storage.getItem() && !auth.user,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: getUserData,
  });

  useEffect(() => {
    if (isSuccess && data) {
      auth.login(data.user);
      navigate({
        to: search.redirect || "/",
        viewTransition: true,
        replace: true,
      });
    }

    if (isError) {
      storage.removeItem();
    }
  }, [isSuccess, isError]);

  const handleClick = (choice: "github" | "guest") => {
    return () => {
      window.location.replace(`${cfg.VITE_BACKEND_URL}/auth/${choice}`);
    };
  };

  return (
    <main className="grid gap-4 min-h-screen content-center justify-center">
      <img src="/logo.png" alt="" className="size-[200px] mx-auto" />
      <div>
        <h1 className="text-5xl text-shadow-emerald-600 text-shadow-lg text-center font-extrabold">
          Deliverer
        </h1>
        <p className="italic text-center mt-3 text-sm">Send one, send all</p>

        <div className="grid gap-3 mt-6">
          <Button text="Continue with Github" onClick={handleClick("github")}>
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="size-6"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </Button>

          <Button text="Continue as Guest" onClick={handleClick("guest")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -960 960 960"
              className="size-6"
            >
              <path d="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z" />
            </svg>
          </Button>
        </div>
      </div>
    </main>
  );
}

type ButtonProps = {
  children: ReactElement<ReactSVGElement>;
  text: string;
  onClick: () => void;
};

function Button({ children, text, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg flex gap-3 px-3.5 py-2.5 bg-primary transition-[border-color] hover:border-cyan-500 duration-300 hover:drop-shadow-(--custom-drop-shadow)"
    >
      {children}
      <span className="text-secondary font-semibold">{text}</span>
    </button>
  );
}
