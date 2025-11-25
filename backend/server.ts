import express, { type ErrorRequestHandler } from "express";
import jwt from "jsonwebtoken";
import z from "zod";

import { asyncHandler } from "@/lib/async-handler.js";
import { prisma } from "@/lib/prisma-client.js";
import { cfg } from "@/lib/env.js";

import auth from "@/routes/auth.js";
import users from "@/routes/users.js";

const server = express();

server.use("/auth", auth);
server.use(
  asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return void res.sendStatus(401);

    jwt.verify(token, cfg.JWT_SECRET, async (err, decoded) => {
      if (!decoded && err !== null) return res.sendStatus(401);
      const { id } = z.object({ id: z.number() }).parse(decoded);
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return res.sendStatus(401);
      req.user = user;
    });
  }),
);

server.use("/users", users);

server.use(((err: Error, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
}) as ErrorRequestHandler);

server.listen(cfg.PORT, () => {
  console.log(`🚀 http://localhost:${cfg.PORT}`);
});
