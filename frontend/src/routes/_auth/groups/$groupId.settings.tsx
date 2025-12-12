import {
  QueryClient,
  queryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Navigate,
  useNavigate,
} from "@tanstack/react-router";
import { MinusSquare, PlusSquare, Trash } from "lucide-react";
import z from "zod";

import { Navbar } from "@/components/Navbar";
import { GROUP_MEMBERS, GROUP_NONMEMBERS, GROUPS } from "@/lib/query-keys";
import { groupsOptions } from "@/lib/query-options";
import {
  deleteGroup,
  getGroupMembers,
  getGroupNonmembers,
  updateGroupMember,
} from "@/lib/api";
import { githubUsername, groupImageURL, profileImageURL } from "@/lib/utils";
import type { Group } from "@shared/prisma/client";
import { GoBack } from "@/components/GoBack";

export const Route = createFileRoute("/_auth/groups/$groupId/settings")({
  component: RouteComponent,
  validateSearch: z.object({
    action: z.enum(["add", "remove"]).optional().default("add"),
  }),
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(groupsOptions(params.groupId));
  },
});

function RouteComponent() {
  const { groupId } = Route.useParams();
  const { auth, queryClient } = Route.useRouteContext();
  const { data, isLoading } = useQuery(groupsOptions(groupId));

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (data!.group.creatorId !== auth.user!.id) {
    return <Navigate to="/groups" replace viewTransition />;
  }

  return (
    <main className="chat-container">
      <Header group={data!.group} queryClient={queryClient} />
      <GroupSettings group={data!.group} queryClient={queryClient} />
      <Navbar />
    </main>
  );
}

type SettingsProps = {
  group: Group;
  queryClient: QueryClient;
};

function Header({ group, queryClient }: SettingsProps) {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: () => deleteGroup(group.id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GROUPS });
      return navigate({ to: "/groups", viewTransition: true, replace: true });
    },
  });

  const clickHandler = () => {
    if (!confirm(`Are you sure you want to delete the "${group.name}" group?`))
      return;

    mutation.mutate();
  };

  return (
    <header className="min-h-[4.5em] flex gap-4 items-center">
      <GoBack
        to="/chat/groups/$groupId"
        params={{ groupId: group.id.toString() }}
      />
      <img
        alt=""
        src={groupImageURL(group.id, group.name)}
        className="size-10 rounded-[50%]"
        fetchPriority="low"
      />
      <h1 className="text-2xl font-bold flex-1">{group.name}</h1>
      <button
        aria-label="delete group"
        onClick={clickHandler}
        className="text-red-500 size-7 mx-4 hover:text-red-400"
      >
        <Trash className="size-6 m-auto" />
      </button>
    </header>
  );
}

const groupActions: ("add" | "remove")[] = ["add", "remove"];

function membersOptions(groupId: number | string, enabled: boolean) {
  return queryOptions({
    queryKey: GROUP_MEMBERS,
    queryFn: () => getGroupMembers(groupId),
    enabled,
  });
}

function nonmembersOptions(groupId: number | string, enabled: boolean) {
  return queryOptions({
    queryKey: GROUP_NONMEMBERS,
    queryFn: () => getGroupNonmembers(groupId),
    enabled,
  });
}

function GroupSettings({ group, queryClient }: SettingsProps) {
  const { action } = Route.useSearch();
  const membersQuery = useQuery(membersOptions(group.id, action === "remove"));
  const nonmembersQuery = useQuery(
    nonmembersOptions(group.id, action === "add"),
  );

  const mutation = useMutation({
    mutationFn: (userId: number) => updateGroupMember(group.id, userId, action),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: action === "add" ? GROUP_NONMEMBERS : GROUP_MEMBERS,
      });
    },
  });

  const activeQuery = membersQuery.isEnabled ? membersQuery : nonmembersQuery;
  const ActionIcon = action === "add" ? PlusSquare : MinusSquare;

  const clickHandler = (userId: number, username: string) => {
    return () => {
      const confirmMsg = `Are you sure you want to remove "${username}" from the group?`;
      if (action === "remove" && !confirm(confirmMsg)) return;
      mutation.mutate(userId);
    };
  };

  return (
    <section className="flex flex-col">
      <div className="flex justify-around text-sm pb-4 pt-2  mx-3 text-center border-b border-b-muted">
        {groupActions.map((action) => (
          <Link
            to="/groups/$groupId/settings"
            viewTransition
            params={{ groupId: group.id.toString() }}
            search={{ action }}
            activeProps={{
              className: `${action === "add" ? "bg-green-400/20" : "bg-red-400/20"} font-bold`,
            }}
            activeOptions={{ includeSearch: true }}
            className={`${action === "add" ? "text-green-500 hover:text-green-400" : "text-red-500 hover:text-red-400"} border-2 py-1 px-2.5 rounded-lg min-w-24`}
          >
            {action[0].toUpperCase() + action.slice(1)}
          </Link>
        ))}
      </div>

      <div className="flex grow flex-col gap-2.5 py-2 mt-2">
        {activeQuery.data?.users.map((user) => (
          <article
            key={user.id}
            className="flex gap-3 bg-muted/25 px-3 py-2 rounded-lg items-center"
          >
            <img
              src={profileImageURL(user, 40)}
              alt=""
              aria-hidden
              className="size-10 rounded-[50%]"
              fetchPriority="low"
            />
            <strong className="overflow-x-auto">
              {githubUsername(user.username)}
            </strong>
            <button
              title={`${action} member`}
              aria-label={`${action} member`}
              className={`${action === "add" ? "text-green-500 hover:text-green-400" : "text-red-500 hover:text-red-400"} ml-auto`}
              onClick={clickHandler(user.id, user.username)}
            >
              <ActionIcon className="size-8" />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
