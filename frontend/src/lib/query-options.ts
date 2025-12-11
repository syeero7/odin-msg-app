import { queryOptions } from "@tanstack/react-query";
import { getGroupById, getUserById } from "./api";
import { GROUP, USER } from "./query-keys";

export function userOptions(userId: number | string) {
  return queryOptions({
    queryKey: USER(userId),
    queryFn: () => getUserById(userId),
  });
}

export function groupsOptions(groupId: number | string) {
  return queryOptions({
    queryKey: GROUP(groupId),
    queryFn: () => getGroupById(groupId),
  });
}
