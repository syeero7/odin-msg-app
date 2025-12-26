import z from "zod";
import { asyncHandler } from "@/lib/async-handler.js";
import { prisma } from "@/lib/prisma-client.js";
import { filterProfane } from "@/lib/profanity-filter.js";

export const getUserGroups = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          user: { id: userId },
        },
      },
    },
  });

  res.json({ groups });
});

export const createGroup = asyncHandler(async (req, res) => {
  const body = z
    .object({ name: z.string().min(3).max(50) })
    .safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ message: body.error.message });
  }

  const userId = req.user!.id;
  const group = await prisma.group.create({
    data: {
      name: filterProfane(body.data.name),
      creator: {
        connect: { id: userId },
      },
      members: {
        create: { userId },
      },
    },
  });

  res.status(201).json({ group });
});

export const getGroupById = asyncHandler(async (req, res) => {
  const params = z.object({ groupId: z.coerce.number() }).safeParse(req.params);
  if (!params.success) return res.sendStatus(400);

  const userId = req.user!.id;
  const { groupId } = params.data;
  const [member, group] = await prisma.$transaction([
    prisma.userGroup.findUnique({
      where: { userId_groupId: { userId, groupId } },
    }),
    prisma.group.findUnique({ where: { id: groupId } }),
  ]);

  if (!member) return res.sendStatus(403);
  if (!group) return res.sendStatus(404);
  res.json({ group });
});

export const getGroupMembers = asyncHandler(async (req, res) => {
  const params = z.object({ groupId: z.coerce.number() }).safeParse(req.params);
  if (!params.success) return res.sendStatus(400);

  const userId = req.user!.id;
  const { groupId } = params.data;
  const [group, users] = await prisma.$transaction([
    prisma.group.findUnique({ where: { id: groupId } }),
    prisma.user.findMany({
      where: {
        NOT: { id: userId },
        groups: { some: { groupId } },
      },
      omit: { bio: true },
    }),
  ]);

  if (!group) return res.sendStatus(404);
  if (group.creatorId !== userId) return res.sendStatus(403);
  res.json({ users });
});

export const getGroupNonmembers = asyncHandler(async (req, res) => {
  const params = z.object({ groupId: z.coerce.number() }).safeParse(req.params);
  if (!params.success) return res.sendStatus(400);

  const userId = req.user!.id;
  const { groupId } = params.data;
  const [group, users] = await prisma.$transaction([
    prisma.group.findUnique({ where: { id: groupId } }),
    prisma.user.findMany({
      where: {
        NOT: {
          groups: {
            some: { groupId },
          },
        },
      },
      omit: { bio: true },
    }),
  ]);

  if (!group) return res.sendStatus(404);
  if (group.creatorId !== userId) return res.sendStatus(403);
  res.json({ users });
});

export const updateGroupMembers = asyncHandler(async (req, res) => {
  const params = z
    .object({ userId: z.coerce.number(), groupId: z.coerce.number() })
    .safeParse(req.params);
  if (!params.success) return res.sendStatus(400);

  const query = z
    .object({ action: z.enum(["add", "remove"]) })
    .safeParse(req.query);
  if (!query.success) return res.sendStatus(400);

  const currentUid = req.user!.id;
  const { userId, groupId } = params.data;
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return res.sendStatus(404);

  switch (query.data.action) {
    case "add": {
      if (currentUid !== group.creatorId) return res.sendStatus(403);

      await prisma.group.update({
        where: { id: groupId },
        data: {
          members: {
            create: { userId },
          },
        },
      });
      break;
    }

    case "remove": {
      if (currentUid !== group.creatorId) {
        return res.sendStatus(403);
      }

      await prisma.userGroup.delete({
        where: {
          userId_groupId: { userId, groupId },
        },
      });
      break;
    }
  }

  res.sendStatus(204);
});

export const deleteGroupById = asyncHandler(async (req, res) => {
  const params = z.object({ groupId: z.coerce.number() }).safeParse(req.params);
  if (!params.success) return res.sendStatus(400);

  const userId = req.user!.id;
  await prisma.group.delete({
    where: {
      id: params.data.groupId,
      creatorId: userId,
    },
  });

  res.sendStatus(204);
});
