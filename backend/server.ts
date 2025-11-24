import express, { type ErrorRequestHandler } from "express";

const server = express();
const { PORT } = process.env;

server.use(((err, _req, res, _next) => {}) as ErrorRequestHandler);

server.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT!}`);
});
