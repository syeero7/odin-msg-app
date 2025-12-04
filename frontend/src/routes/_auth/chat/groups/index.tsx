import { Navbar } from "@/components/Navbar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/chat/groups/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main>
      <Navbar />
    </main>
  );
}
