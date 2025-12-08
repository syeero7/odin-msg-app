import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { githubUsername, profileImageURL } from "@/lib/utils";
import { userOptions } from "@/lib/query-options";
import { Navbar } from "@/components/Navbar";
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
  return (
    <main className="chat-container">
      <Header />
      <UserProfile />
      <Navbar />
    </main>
  );
}

function Header() {
  return <header className="min-h-[4.5em]"></header>;
}

function UserProfile() {
  const { auth, queryClient } = Route.useRouteContext();
  const user = auth.user!;
  const { data } = useQuery(userOptions(user.id));
  const mutation = useMutation({
    mutationFn: updateUserBio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER(user.id) });
    },
  });

  const formAction = (formData: FormData) => {
    const bio = z.string().parse(formData.get("bio"));
    if (!bio.length) return;
    mutation.mutate({ bio });
  };

  return (
    <section>
      <img
        src={profileImageURL(user, 192)}
        alt="avatar"
        className="rounded-[50%] size-48 mx-auto mt-4"
      />
      <h1 className="text-center font-semibold text-3xl mt-3">
        {githubUsername(user.username)}
      </h1>

      <form action={formAction} className="py-3 px-2 grid">
        <label className="grid gap-1">
          <span>Bio:</span>
          <textarea
            rows={3}
            name="bio"
            disabled={mutation.isPending}
            defaultValue={data?.user.bio || ""}
            className="bg-muted resize-none rounded-lg p-2 text-sm"
          ></textarea>
        </label>
        <button
          disabled={mutation.isPending}
          className="text-xs py-2 px-4 border-2 border-muted-foreground rounded-lg font-semibold ml-auto mt-3  hover:text-green-500 hover:border-green-500"
        >
          Update
        </button>
      </form>
    </section>
  );
}
