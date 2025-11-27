import z from "zod";
import { asyncHandler } from "@/lib/async-handler.js";
import { prisma } from "@/lib/prisma-client.js";

const messageQuery = z
  .object({
    recipient_id: z.number(),
    before_id: z.number().optional(),
    limit: z.number().optional().default(20),
  })
  .transform(({ recipient_id, before_id, ...rest }) => {
    return {
      recipientId: recipient_id,
      ...(before_id && { beforeId: before_id }),
      ...rest,
    };
  });

export const getDirectMessages = asyncHandler(async (req, res) => {
  const query = messageQuery.safeParse(req.query);
  if (!query.success) return res.sendStatus(400);

  const user1 = req.user!.id;
  const { recipientId: user2, limit, beforeId } = query.data;
  const messages = await prisma.message.findMany({
    where: {
      type: "DIRECT",
      OR: [
        { senderId: user1, recipientId: user2 },
        { senderId: user2, recipientId: user1 },
      ],
      ...(beforeId && { id: { gt: beforeId } }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  res.json({ messages });
});

export const getGroupMessages = asyncHandler(async (req, res) => {
  const query = messageQuery.safeParse(req.query);
  if (!query.success) return res.sendStatus(400);

  const userId = req.user!.id;
  const { recipientId: groupId, limit, beforeId } = query.data;
  const [member, messages] = await prisma.$transaction([
    prisma.userGroup.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    }),
    prisma.message.findMany({
      where: {
        type: "GROUP",
        groupId,
        ...(beforeId && { id: { gt: beforeId } }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ]);

  if (!member) return res.sendStatus(403);
  res.json({ messages });
});
