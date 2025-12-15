import type { Server, Socket } from "socket.io";
import type { User } from "@shared/prisma/client.js";
import type { string } from "zod";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }

  type SocketData = {
    user?: User;
  };

  interface ServerToClientEvents {
    [k: string]: any;
  }

  interface ClientToServerEvents {
    [k: string]: (
      reqBody: Record<string, unknown>,
      callback: (resBody: Record<string, unknown>) => void,
    ) => void;
  }

  type SocketIO = Server<
    ClientToServerEvents,
    ServerToClientEvents,
    {},
    SocketData
  >;

  type SocketWithData = Socket<{}, {}, {}, SocketData>;
}
