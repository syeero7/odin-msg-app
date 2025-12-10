import type { QueryKey } from "@tanstack/react-query";

export const CURRENT_USER: QueryKey = ["currentUser"];
export const GROUPS: QueryKey = ["groups"];
export const USERS: QueryKey = ["users"];
export const USER = (userId: number | string): QueryKey => {
  return ["user", `${userId}`];
};
export const DIRECT_MSG = (userId: number | string): QueryKey => {
  return ["direct", `${userId}`];
};
export const GROUP_MSG = (groupId: number | string): QueryKey => {
  return ["direct", `${groupId}`];
};
