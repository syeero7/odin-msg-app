import { Link, linkOptions, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, LogOut, UserPen, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { CURRENT_USER } from "@/lib/query-keys";
import { useAuth } from "./AuthProvider";

type NavbarProps = {
  hiddenOnMobile?: boolean;
};

const options = linkOptions([
  { to: "/users", label: "Users", Icon: Users },
  { to: "/groups", label: "Groups", Icon: LayoutGrid },
  { to: "/edit-profile", label: "Edit profile", Icon: UserPen },
]);

export function Navbar({ hiddenOnMobile }: NavbarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const client = useQueryClient();

  const handleClick = () => {
    logout();
    client.removeQueries({ queryKey: CURRENT_USER });
    navigate({ to: "/login", viewTransition: true });
  };

  return (
    <nav
      className={`sm:px-4 md:flex-col flex md:w-40 ${hiddenOnMobile ? "max-md:hidden" : ""}`}
    >
      {options.map(({ to, Icon, label }) => (
        <Link
          key={to}
          to={to}
          viewTransition
          activeOptions={{ exact: true }}
          activeProps={{ className: "font-bold text-cyan-500" }}
          className="md:flex gap-4 max-w-fit hover:text-cyan-400"
        >
          <Icon className="mx-auto size-6" />
          <span className="text-sm md:mt-0.5">{label}</span>
        </Link>
      ))}

      <button
        onClick={handleClick}
        className="text-sm max-md:ml-auto max-w-fit md:flex gap-4 md:mt-auto group"
      >
        <LogOut className="mx-auto text-red-500 group-hover:text-red-400" />
        <span className="text-sm font-semibold md:mt-0.5 text-red-500 group-hover:text-red-400">
          Logout
        </span>
      </button>
    </nav>
  );
}
