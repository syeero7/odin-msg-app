import type { User } from "@shared/prisma/client";
import { cfg } from "./env";
import z from "zod";

export function githubUsername(str: string) {
  if (str !== cfg.VITE_GUEST_USERNAME) return str;
  return str.replace(/[^a-z0-9-.]/gi, "").replace(/^[.-]+|[.-]+$/g, "");
}

export function profileImageURL(user: User, size: number) {
  let url = `https://avatars.githubusercontent.com/u/${user.githubId}?v=4&size=${size}`;
  if (user.username === cfg.VITE_GUEST_USERNAME) {
    url = `https://api.dicebear.com/9.x/identicon/svg?backgroundColor=ffffff&seed=guest_#${user.id}&size=${size}`;
  }
  return url;
}

export function groupImageURL(id: number, name: string) {
  return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${name}-${id}-G&size=40`;
}

export async function processFormData(formData: FormData) {
  const data: { type: string; content: string }[] = [];
  const text = z.string().parse(formData.get("text"));
  const image = z.instanceof(File).parse(formData.get("image"));

  if (text.length) data.push({ type: "text", content: text });
  if (image.size) {
  }

  return data;
}
