import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import z from "zod";
import { Navbar } from "@/components/Navbar";
import { UserProfile } from "@/components/UserProfile";
import { userOptions } from "@/lib/query-options";
import { updateUserBio } from "@/lib/api";
import { USER } from "@/lib/query-keys";

export const Route = createFileRoute("/_auth/edit-profile")({
  component: RouteComponent,
  loader: ({ context }) => {
    const { auth, queryClient } = context;
    return queryClient.ensureQueryData(userOptions(auth.user!.id));
  },
});

function RouteComponent() {
  const { auth, queryClient } = Route.useRouteContext();
  const mutation = useMutation({
    mutationFn: updateUserBio,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USER(auth.user!.id) });
    },
  });

  const formAction = (formData: FormData) => {
    const bio = z.string().parse(formData.get("bio"));
    if (!bio.length) return;
    mutation.mutate({ bio });
  };

  return (
    <main className="chat-container">
      <Header />
      <UserProfile
        userId={auth.user!.id}
        formAction={formAction}
        mutation={mutation}
      />
      <Navbar />
    </main>
  );
}

function Header() {
  return <header className="min-h-[4.5em]"></header>;
}
