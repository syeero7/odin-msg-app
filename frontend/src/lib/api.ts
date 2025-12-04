import { getItem } from "./storage";
import { cfg } from "./env";
import type { Group, User } from "@shared/prisma/client";

export function getUserData() {
  return fetcher<{ user: User }>("/users/me", "GET", ["auth"]);
}

export function getGroups() {
  return fetcher<{ groups: Group[] }>("/groups", "GET", ["auth"]);
}

export function createGroup(data: Pick<Group, "name">) {
  return fetcher<{ group: Group }>("/groups", "POST", ["auth", "json"], data);
}

export function getUsers() {
  return fetcher<{ users: User[] }>("/users", "GET", ["auth"]);
}

type FetcherMethod = "GET" | "POST" | "PUT" | "DELETE";
type FetcherHeader = "auth" | "json" | "multipart";

async function fetcher<T>(
  path: string,
  method: FetcherMethod,
  headers?: FetcherHeader[],
  body?: Record<string, unknown>,
): Promise<T> {
  const url = `${cfg.VITE_BACKEND_URL}${path}`;
  const options: RequestInit = { method };

  if (method === "POST" && body) {
    options.body = JSON.stringify(body);
  }

  if (headers?.length) {
    const tmp: Record<string, string> = {};

    headers.forEach((header) => {
      switch (header) {
        case "auth": {
          const token = getItem();
          tmp["Authorization"] = `Bearer ${token}`;
          break;
        }

        case "json": {
          tmp["Content-Type"] = "application/json";
          break;
        }

        case "multipart": {
          tmp["Content-Type"] = "";
          break;
        }
      }
    });

    options.headers = tmp;
  }

  const res = await fetch(url, options);
  if (!res.ok) throw res;
  return (await res.json()) as T;
}
