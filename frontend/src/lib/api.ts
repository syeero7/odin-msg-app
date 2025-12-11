import { getItem } from "./storage";
import { cfg } from "./env";
import type { Group, User } from "@shared/prisma/client";
import type {
  DirectMessaages,
  GroupMessages,
} from "@/hooks/use-messaages-query";

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

export function getUserById(userId: number | string) {
  return fetcher<{ user: User }>(`/users/${userId}`, "GET", ["auth"]);
}

export function updateUserBio(data: Pick<User, "bio">) {
  return fetcher("/users", "PUT", ["auth", "json"], data);
}

export function getGroupById(groupId: number | string) {
  return fetcher<{ group: Group }>(`/groups/${groupId}`, "GET", ["auth"]);
}

export type MessageQueries = {
  limit?: number;
  cursor?: number;
  recipient_id: number | string;
};

export function getDirectMessages(q: MessageQueries) {
  const path = `/messages/direct${generateQueryString(q)}`;
  return fetcher<DirectMessaages>(path, "GET", ["auth"]);
}

export function getGroupMessages(q: MessageQueries) {
  const path = `/messages/group${generateQueryString(q)}`;
  return fetcher<GroupMessages>(path, "GET", ["auth"]);
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

  if ((method === "POST" || method === "PUT") && body) {
    options.body = JSON.stringify(body);
  }

  if (headers?.length) {
    options.headers = generateHeaders(headers);
  }

  const res = await fetch(url, options);
  if (!res.ok) throw res;
  return (await res.json()) as T;
}

function generateHeaders(headers: FetcherHeader[]) {
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

  return tmp;
}

function generateQueryString(queries: MessageQueries) {
  const search = new URLSearchParams();

  Object.entries(queries).forEach(([key, val]) => {
    search.set(key, `${val}`);
  });

  return `?${search.toString()}`;
}
