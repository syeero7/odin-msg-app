import type { QueryKey } from "@tanstack/react-query";

export const CURRENT_USER: QueryKey = ["current_user"];
export const GROUPS: QueryKey = ["groups"];
export const USERS: QueryKey = ["users"];
export const USER = (userId: number | string): QueryKey => {
  return ["user", `${userId}`];
};
export const DIRECT_MSG = (userId: number | string): QueryKey => {
  return ["direct_msg", `${userId}`];
};
export const GROUP = (groupId: number | string): QueryKey => {
  return ["group", `${groupId}`];
};
export const GROUP_MSG = (groupId: number | string): QueryKey => {
  return ["group_msg", `${groupId}`];
};
