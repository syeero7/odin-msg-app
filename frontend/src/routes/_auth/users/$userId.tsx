import { createFileRoute } from "@tanstack/react-router";
import { userOptions } from "@/lib/query-options";
import { Navbar } from "@/components/Navbar";
import { UserProfile } from "@/components/UserProfile";
import { GoBack } from "@/components/GoBack";

export const Route = createFileRoute("/_auth/users/$userId")({
  component: RouteComponent,
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(userOptions(params.userId));
  },
});

function RouteComponent() {
  const { userId } = Route.useParams();

  return (
    <main className="chat-container">
      <Header userId={userId} />
      <UserProfile userId={userId} />
      <Navbar />
    </main>
  );
}

function Header({ userId }: { userId: string }) {
  return (
    <header className="min-h-[4.5em] flex items-center">
      <GoBack to="/chat/users/$userId" params={{ userId }} />
    </header>
  );
}
