import type { ExtendedError } from "socket.io";
import jwt from "jsonwebtoken";
import z from "zod";

import { asyncHandler } from "@/lib/async-handler.js";
import { prisma } from "@/lib/prisma-client.js";
import { cfg } from "@/lib/env.js";

type SocketMiddleWare = (
  socket: SocketWithData,
  next: (err?: ExtendedError) => void,
) => void;

export const authenticate = asyncHandler(async (req, res, next) => {
  const user = await verifyToken(req.headers.authorization);
  if (!user) return res.sendStatus(401);
  req.user = user;
  next();
});

export const authenticateWS: SocketMiddleWare = async (socket, next) => {
  const user = await verifyToken(socket.handshake.headers.authorization);
  if (!user) return next(new Error("unauthorized"));
  socket.data.user = user;
  next();
};

async function verifyToken(authorization?: string) {
  const token = authorization?.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, cfg.JWT_SECRET);
    const { id } = z.object({ id: z.number() }).parse(decoded);
    const user = await prisma.user.findUnique({ where: { id } });
    return user;
  } catch {
    return null;
  }
}
