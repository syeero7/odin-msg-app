import { createContext, use, useState, type PropsWithChildren } from "react";
import * as storage from "@/lib/storage";

type AuthUser = {
  id: number;
  username: string;
};

export type AuthState = {
  user: AuthUser | null;
  logout: () => void;
  login: (u: AuthUser) => void;
};

const AuthContext = createContext<undefined | AuthState>(undefined);

export const useAuth = (): AuthState => {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");

  return ctx;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (user: AuthUser) => {
    setUser(user);
  };

  const logout = async () => {
    setUser(null);
    storage.removeItem();
  };

  return <AuthContext value={{ user, logout, login }}>{children}</AuthContext>;
}
