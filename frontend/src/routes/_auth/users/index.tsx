import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { USERS } from "@/lib/query-keys";
import { getUsers } from "@/lib/api";
import { cfg } from "@/lib/env";

const usersQuery = queryOptions({
  queryKey: USERS,
  queryFn: getUsers,
});

export const Route = createFileRoute("/_auth/users/")({
  component: RouteComponent,
  loader: ({ context }) => context.queryClient.ensureQueryData(usersQuery),
});

function RouteComponent() {
  return (
    <main className="chat-container">
      <Header />
      <UserList />
      <Navbar />
    </main>
  );
}

function Header() {
  return <header className="min-h-[4.5em]"></header>;
}

function UserList() {
  const { isLoading, data } = useQuery(usersQuery);

  return (
    <section>
      {isLoading && <p>Loading...</p>}
      {data &&
        (!data.users.length ? (
          <p>No users</p>
        ) : (
          data.users.map(({ id, username, githubId }) => {
            let imgURL = `https://avatars.githubusercontent.com/u/${githubId}?v=4&size=40`;
            if (username === cfg.VITE_GUEST_USERNAME) {
              imgURL = `https://api.dicebear.com/9.x/identicon/svg?backgroundColor=ffffff&seed=guest_#${id}&size=40`;
              username = username
                .replace(/[^a-z0-9-.]/gi, "")
                .replace(/^[.-]+|[.-]+$/g, "");
            }

            return (
              <Link
                to="/chat/users/$userId"
                params={{ userId: id.toString() }}
                className="flex gap-3 p-3 hover:text-cyan-500"
                viewTransition
                key={id}
              >
                <img
                  src={imgURL}
                  alt=""
                  aria-hidden
                  className="size-10 rounded-[50%]"
                />
                <span className="overflow-x-auto mt-1.5">{username}</span>
              </Link>
            );
          })
        ))}
    </section>
  );
}
