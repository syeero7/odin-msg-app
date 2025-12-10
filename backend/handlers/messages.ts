import z from "zod";
import { asyncHandler } from "@/lib/async-handler.js";
import { prisma } from "@/lib/prisma-client.js";

const messageQuery = z
  .object({
    recipient_id: z.coerce.number(),
    cursor: z.coerce.number().optional(),
    limit: z.coerce.number().optional().default(20),
  })
  .transform(({ recipient_id, ...rest }) => {
    return { recipientId: recipient_id, ...rest };
  });

export const getDirectMessages = asyncHandler(async (req, res) => {
  const query = messageQuery.safeParse(req.query);
  if (!query.success) return res.sendStatus(400);

  const user1 = req.user!.id;
  const { recipientId: user2, limit, cursor } = query.data;
  const items = await prisma.message.findMany({
    where: {
      type: "DIRECT",
      OR: [
        { senderId: user1, recipientId: user2 },
        { senderId: user2, recipientId: user1 },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor } }),
    skip: cursor ? 1 : 0,
  });

  const messages = items.length > limit ? items.slice(0, -1) : items;
  const nextCursor =
    items.length > limit ? messages[messages.length - 1].id : undefined;

  res.json({ messages, nextCursor });
});

export const getGroupMessages = asyncHandler(async (req, res) => {
  const query = messageQuery.safeParse(req.query);
  if (!query.success) return res.sendStatus(400);

  const userId = req.user!.id;
  const { recipientId: groupId, limit, cursor } = query.data;
  const [member, items] = await prisma.$transaction([
    prisma.userGroup.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    }),
    prisma.message.findMany({
      where: {
        type: "GROUP",
        groupId,
      },
      include: { sender: { omit: { bio: true } } },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor } }),
      skip: cursor ? 1 : 0,
    }),
  ]);

  if (!member) return res.sendStatus(403);
  const messages = items.length > limit ? items.slice(0, -1) : items;
  const nextCursor =
    items.length > limit ? messages[messages.length - 1].id : undefined;

  res.json({ messages, nextCursor });
});
