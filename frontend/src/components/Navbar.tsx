import { Link, linkOptions, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, LogOut, UserPen, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./AuthProvider";

const options = linkOptions([
  { to: "/chat/users", label: "Users", Icon: Users },
  { to: "/chat/groups", label: "Groups", Icon: LayoutGrid },
  { to: "/edit-profile", label: "Edit profile", Icon: UserPen },
]);

export function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const client = useQueryClient();

  const handleClick = () => {
    logout();
    client.removeQueries({ queryKey: ["current_user"] });
    navigate({ to: "/login", viewTransition: true });
  };

  // TODO: set nav max height
  return (
    <nav className="flex gap-4 p-4 sm:px-6 md:flex-col md:max-w-fit">
      {options.map(({ to, Icon, label }) => (
        <Link
          key={to}
          to={to}
          viewTransition
          activeProps={{ className: "font-bold text-cyan-500" }}
          className="md:flex gap-4 max-w-fit"
        >
          <Icon className="mx-auto" />
          <span className="text-sm md:mt-0.5">{label}</span>
        </Link>
      ))}

      <button
        onClick={handleClick}
        className="text-sm max-md:ml-auto max-w-fit md:flex gap-4 md:mt-auto"
      >
        <LogOut className="mx-auto  text-red-500 " />
        <span className="text-sm font-semibold md:mt-0.5 text-red-500">
          Logout
        </span>
      </button>
    </nav>
  );
}
