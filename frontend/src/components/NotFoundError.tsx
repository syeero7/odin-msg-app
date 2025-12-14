import { Link } from "@tanstack/react-router";

export default function NotFoundError() {
  return (
    <main className="flex text-center gap-4 flex-col min-h-screen items-center justify-center">
      <h1 className="text-3xl">Oops! Something went wrong!</h1>
      <p className="italic">404 Not Found</p>
      <p>
        Back to{" "}
        <Link to="/" viewTransition replace className="text-cyan-500 underline">
          home
        </Link>
      </p>
    </main>
  );
}
