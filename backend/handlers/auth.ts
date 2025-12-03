import jwt from "jsonwebtoken";
import z from "zod";

import { asyncHandler } from "@/lib/async-handler.js";
import { prisma } from "@/lib/prisma-client.js";
import { cfg } from "@/lib/env.js";

export const githubSignin = asyncHandler(async (_req, res) => {
  const rand = crypto.randomUUID();
  const state = jwt.sign({ rand }, cfg.CSRF_SECRET, {
    expiresIn: "5m",
  });

  const url = new URL("/login/oauth/authorize", "https://github.com");
  url.searchParams.set("client_id", cfg.GITHUB_CLIENT_ID);
  url.searchParams.set("scope", "user:email");
  url.searchParams.set("state", state);

  res.redirect(url.toString());
});

export const githubCallback = asyncHandler(async (req, res) => {
  const { code, state } = z
    .object({ code: z.string(), state: z.string() })
    .parse(req.query);

  jwt.verify(state, cfg.CSRF_SECRET, async (err, decoded) => {
    if (!decoded && err !== null) return res.sendStatus(401);

    const tokenURL = new URL("/login/oauth/access_token", "https://github.com");
    tokenURL.searchParams.set("client_id", cfg.GITHUB_CLIENT_ID);
    tokenURL.searchParams.set("client_secret", cfg.GITHUB_CLIENT_SECRET);
    tokenURL.searchParams.set("code", code);
    const tokenRes = await fetch(tokenURL.toString(), {
      method: "POST",
      headers: { Accept: "application/json " },
    });
    if (!tokenRes.ok) return res.sendStatus(tokenRes.status);
    const { access_token } = z
      .object({ access_token: z.string() })
      .parse(await tokenRes.json());

    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!userRes.ok) return res.sendStatus(userRes.status);
    const { id, login } = z
      .object({ id: z.number(), login: z.string() })
      .parse(await userRes.json());

    let user = await prisma.user.findUnique({ where: { githubId: id } });
    if (!user) {
      user = await prisma.user.create({
        data: { githubId: id, username: login },
      });
    }

    const url = getURLWithToken(user.id);
    res.redirect(url);
  });
});

export const guestSignin = asyncHandler(async (_, res) => {
  const guest = await prisma.user.findUnique({
    where: { username: cfg.GUEST_USERNAME },
  });
  if (!guest) throw new Error("Guest not found");

  const url = getURLWithToken(guest.id);
  res.redirect(url);
});

function getURLWithToken(id: number) {
  const token = jwt.sign({ id }, cfg.JWT_SECRET, {
    expiresIn: "1d",
  });

  const url = new URL("/login", cfg.FRONTEND_URL);
  url.searchParams.set("token", token);
  return url.toString();
}
