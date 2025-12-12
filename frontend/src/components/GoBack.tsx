import { Link, type LinkProps } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

type GoBackLinkProps = Pick<LinkProps, "to" | "params"> & {
  hiddenOnDesktop?: boolean;
};

export function GoBack({ to, params, hiddenOnDesktop }: GoBackLinkProps) {
  return (
    <Link
      to={to}
      params={params}
      viewTransition
      className={`size-7 ml-2 hover:text-cyan-500 ${hiddenOnDesktop ? "md:hidden" : ""}`}
    >
      <ChevronLeft className="size-7" />
    </Link>
  );
}
