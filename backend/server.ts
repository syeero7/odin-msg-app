import express, { type ErrorRequestHandler } from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";

import { authenticate, authenticateWS } from "@/lib/authenticate.js";
import { cfg } from "@/lib/env.js";

import auth from "@/routes/auth.js";
import users from "@/routes/users.js";
import groups from "@/routes/groups.js";

const server = express();

server.use(
  cors({
    origin: cfg.FRONTEND_URL,
    methods: ["GET", "PUT", "POST", "DELETE"],
  }),
);
server.use(express.json());

server.use("/auth", auth);
server.use(authenticate);

server.use("/users", users);
server.use("/groups", groups);

const httpServer = createServer(server);
const io = new Server(httpServer, {
  cors: { origin: cfg.FRONTEND_URL },
});

io.use(authenticateWS);

server.use(((err: Error, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
}) as ErrorRequestHandler);

httpServer.listen(cfg.PORT, () => {
  console.log(`🚀 http://localhost:${cfg.PORT}`);
});
