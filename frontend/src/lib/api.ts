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

export function getUserById(userId: urlParam) {
  return fetcher<{ user: User }>(`/users/${userId}`, "GET", ["auth"]);
}

export function updateUserBio(data: Pick<User, "bio">) {
  return fetcher("/users", "PUT", ["auth", "json"], data);
}

export function getGroupById(groupId: urlParam) {
  return fetcher<{ group: Group }>(`/groups/${groupId}`, "GET", ["auth"]);
}

export function deleteGroup(groupId: urlParam) {
  return fetcher(`/groups/${groupId}`, "DELETE", ["auth"]);
}

export function getGroupMembers(groupId: urlParam) {
  return fetcher<{ users: User[] }>(`/groups/${groupId}/members`, "GET", [
    "auth",
  ]);
}

export function getGroupNonmembers(groupId: urlParam) {
  return fetcher<{ users: User[] }>(`/groups/${groupId}/nonmembers`, "GET", [
    "auth",
  ]);
}

export function updateGroupMember(
  groupId: urlParam,
  userId: urlParam,
  action: "add" | "remove",
) {
  return fetcher(
    `/groups/${groupId}/members/${userId}?action=${action}`,
    "PUT",
    ["auth"],
  );
}

export function uploadImage(data: { image: File }) {
  return fetcher<{ url: string }>(
    "/assets/images",
    "POST",
    ["auth", "multipart"],
    data,
  );
}

type urlParam = string | number;

export type MessageQueries = {
  limit?: number;
  cursor?: number;
  recipient_id: urlParam;
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
  const tmp: Record<string, string> = {};
  const uploadRequest = method === "POST" || method === "PUT";

  headers?.forEach((header) => {
    switch (header) {
      case "auth": {
        const token = getItem();
        tmp["Authorization"] = `Bearer ${token}`;
        break;
      }

      case "json": {
        tmp["Content-Type"] = "application/json";
        if (uploadRequest) {
          options.body = JSON.stringify(body);
        }
        break;
      }

      case "multipart": {
        const formData = new FormData();
        for (const key in body) {
          const val = body[key];
          if (!(val instanceof Blob)) throw new Error(`$${key} is not a Blob`);
          formData.append(key, val);
          options.body = formData;
        }
      }
    }
  });

  options.headers = tmp;

  const res = await fetch(url, options);
  if (!res.ok) throw res;
  return (await res.json()) as T;
}

function generateQueryString(queries: MessageQueries) {
  const search = new URLSearchParams();

  Object.entries(queries).forEach(([key, val]) => {
    search.set(key, `${val}`);
  });

  return `?${search.toString()}`;
}
