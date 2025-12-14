import { Link, type ErrorComponentProps } from "@tanstack/react-router";

export default function CustomError({ error }: ErrorComponentProps) {
  return (
    <main className="flex text-center gap-4 flex-col min-h-screen items-center justify-center">
      <h1 className="text-3xl">Oops! Something went wrong!</h1>
      {error instanceof Response ? (
        <p className="italic">
          {error.message || `${error.status} ${error.statusText}`}
        </p>
      ) : (
        <>
          <p>{error.message}</p>
          {error.cause && <p>{`${error.cause}`}</p>}
          {error.stack && <pre>{error.stack}</pre>}
        </>
      )}
      <p>
        Back to{" "}
        <Link to="/" viewTransition replace className="text-cyan-500 underline">
          home
        </Link>
      </p>
    </main>
  );
}
