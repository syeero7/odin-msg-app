import z from "zod";
import type { MessageCreateInput } from "@shared/prisma/models.js";
import { prisma } from "@/lib/prisma-client.js";

const messageData = z.object({
  recipientId: z.number(),
  contentType: z.enum(["text", "image"]),
  content: z.string().min(1).min(2000),
});

export function handleWS(io: SocketIO) {
  io.on("connection", (socket) => {
    const { user } = socket.data;

    if (!user) return console.error("USER IS REQUIRED!");
    socket.join(`user:${user.id}`);

    socket.on("send_direct", async (reqBody, cb) => {
      const reqData = messageData.safeParse(reqBody);
      if (!reqData.success) {
        return cb({ status: 400, error: reqData.error.errors });
      }

      const { recipientId, content, contentType } = reqData.data;
      if (recipientId === user.id) {
        return cb({ status: 400, error: "nope" });
      }

      const data: MessageCreateInput = {
        type: "DIRECT",
        sender: { connect: { id: user.id } },
        recipient: { connect: { id: recipientId } },
      };
      if (contentType === "text") data.text = content;
      if (contentType === "image") data.imageUrl = content;
      const msg = await prisma.message.create({ data });

      io.to(`user:${recipientId}`).emit("receive_direct", msg);
      io.to(`user:${user.id}`).emit("receive_direct", msg);
      cb({ status: 200 });
    });

    socket.on("send_group", async (reqBody, cb) => {
      const reqData = messageData.safeParse(reqBody);
      if (!reqData.success) {
        return cb({ status: 400, error: reqData.error.errors });
      }

      const { recipientId, content, contentType } = reqData.data;
      const member = await prisma.userGroup.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId: recipientId,
          },
        },
      });
      if (!member) return cb({ status: 403 });
      socket.join(`group:${recipientId}`);

      const data: MessageCreateInput = {
        type: "GROUP",
        sender: { connect: { id: user.id } },
        group: { connect: { id: recipientId } },
      };
      if (contentType === "text") data.text = content;
      if (contentType === "image") data.imageUrl = content;
      const msg = await prisma.message.create({ data });

      socket.to(`group:${recipientId}`).emit("receive_group", msg);
      cb({ status: 200 });
    });
  });
}
