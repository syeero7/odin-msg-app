import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusSquare } from "lucide-react";
import z from "zod";
import { createGroup, getGroups } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { GROUPS } from "@/lib/query-keys";

const groupsQuery = queryOptions({
  queryKey: GROUPS,
  queryFn: getGroups,
});

export const Route = createFileRoute("/_auth/groups/")({
  component: RouteComponent,
  loader: ({ context }) => context.queryClient.ensureQueryData(groupsQuery),
});

function RouteComponent() {
  return (
    <main className="chat-container">
      <Header />
      <GroupList />
      <Navbar />
    </main>
  );
}

function Header() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUPS });
    },
  });

  const formAction = (formData: FormData) => {
    const name = z.string().parse(formData.get("name"));
    if (!name.length) return;
    mutation.mutate({ name });
  };

  return (
    <header className="px-3 py-4">
      <form action={formAction} className="flex gap-3 max-md:justify-center">
        <input
          name="name"
          type="text"
          maxLength={50}
          aria-label="group name"
          className="px-2 py-1 border border-primary-foreground rounded-lg bg-secondary"
          disabled={mutation.isPending}
        />
        <button aria-label="create group" disabled={mutation.isPending}>
          <PlusSquare className="size-10 text-green-500 hover:text-green-400" />
        </button>
      </form>
    </header>
  );
}

function GroupList() {
  const { isLoading, data } = useQuery(groupsQuery);

  return (
    <section>
      {isLoading && <p>Loading...</p>}
      {!!data &&
        (data.groups.length === 0 ? (
          <p>No groups</p>
        ) : (
          data.groups.map(({ id, name }) => {
            const imgURL = `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${name}-${id}-G&size=40`;

            return (
              <Link
                to={"/chat/groups/$groupId"}
                params={{ groupId: id.toString() }}
                viewTransition
                className="flex gap-3 p-3 hover:text-cyan-500"
                key={id}
              >
                <img
                  src={imgURL}
                  alt=""
                  aria-hidden
                  className="rounded-[50%] size-10"
                />
                <span className="overflow-x-auto mt-1.5">{name}</span>
              </Link>
            );
          })
        ))}
    </section>
  );
}
