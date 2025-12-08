import { queryOptions } from "@tanstack/react-query";
import { getUserById } from "./api";
import { USER } from "./query-keys";

export function userOptions(userId: number | string) {
  return queryOptions({
    queryKey: USER(userId),
    queryFn: () => getUserById(userId),
  });
}
