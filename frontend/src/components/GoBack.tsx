import { Link, type LinkProps } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function GoBack(props: Pick<LinkProps, "to" | "params">) {
  return (
    <Link {...props} viewTransition className="size-7 hover:text-cyan-500">
      <ChevronLeft className="size-7" />
    </Link>
  );
}
