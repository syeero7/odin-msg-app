import type { User } from "@/generated/prisma/client.js";
import type { Socket } from "socket.io";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
