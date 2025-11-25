import { asyncHandler } from "@/lib/async-handler.js";
import { prisma } from "@/lib/prisma-client.js";
import z from "zod";

export const getUsers = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const users = await prisma.user.findMany({
    omit: { bio: true },
    where: { NOT: { id: userId } },
  });

  res.json({ users });
});

export const getUserById = asyncHandler(async (req, res) => {
  const result = z.object({ userId: z.coerce.number() }).safeParse(req.params);
  if (!result.success) return res.sendStatus(400);

  const user = await prisma.user.findUnique({
    where: { id: result.data.userId },
  });

  if (!user) return res.sendStatus(404);
  return res.json({ user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const params = z.object({ userId: z.coerce.number() }).safeParse(req.params);
  if (!params.success) return res.sendStatus(400);

  const body = z.object({ bio: z.string().max(200) }).safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ message: body.error.message });
  }

  await prisma.user.update({
    where: { id: params.data.userId },
    data: body.data,
  });

  res.sendStatus(204);
});
