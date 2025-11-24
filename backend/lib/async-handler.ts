import type { Request, Response, NextFunction } from "express";
import type { User } from "@/generated/prisma/client.js";

type RequestHandler = (
  req: Request & { user?: User },
  res: Response,
  next: NextFunction,
) => void;

export function asyncHandler<T extends RequestHandler>(fn: T): RequestHandler {
  return (req, res, next) => {
    const fnReturn = fn(req, res, next);
    return Promise.resolve(fnReturn).catch(next);
  };
}
