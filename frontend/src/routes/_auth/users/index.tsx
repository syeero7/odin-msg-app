import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { githubUsername, profileImageURL } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { USERS } from "@/lib/query-keys";
import { getUsers } from "@/lib/api";

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
          data.users.map((user) => (
            <Link
              to="/chat/users/$userId"
              params={{ userId: user.id.toString() }}
              className="flex gap-3 p-3 hover:text-cyan-500"
              viewTransition
              key={user.id}
            >
              <img
                src={profileImageURL(user, 40)}
                alt=""
                aria-hidden
                className="size-10 rounded-[50%]"
                fetchPriority="low"
              />
              <span className="overflow-x-auto mt-1.5">
                {githubUsername(user.username)}
              </span>
            </Link>
          ))
        ))}
    </section>
  );
}
