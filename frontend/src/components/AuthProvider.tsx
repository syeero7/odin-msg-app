import { createContext, use, useState, type PropsWithChildren } from "react";
import type { User } from "@shared/prisma/client";
import * as storage from "@/lib/storage";

export type AuthState = {
  user: User | null;
  logout: () => void;
  login: (u: User) => void;
};

const AuthContext = createContext<undefined | AuthState>(undefined);

export const useAuth = (): AuthState => {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");

  return ctx;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);

  const login = (user: User) => {
    setUser(user);
  };

  const logout = async () => {
    setUser(null);
    storage.removeItem();
  };

  return <AuthContext value={{ user, logout, login }}>{children}</AuthContext>;
}
