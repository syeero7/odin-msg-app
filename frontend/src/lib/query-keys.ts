import type { QueryKey } from "@tanstack/react-query";

export const CURRENT_USER: QueryKey = ["currentUser"];
export const GROUPS: QueryKey = ["groups"];
export const USERS: QueryKey = ["users"];
export const USER = (userId: string | number): QueryKey => {
  return ["user", `${userId}`];
};
