import { getItem } from "./storage";
import { cfg } from "./env";

export function getUserData() {
  return fetcher("/users/me", "GET", ["auth"]);
}

type FetcherMethod = "GET" | "POST" | "PUT" | "DELETE";
type FetcherHeader = "auth" | "json" | "multipart";

async function fetcher<T>(
  path: string,
  method: FetcherMethod,
  headers?: FetcherHeader[],
): Promise<T> {
  const url = `${cfg.VITE_BACKEND_URL}${path}`;
  const options: RequestInit = { method };

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
