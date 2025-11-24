import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client.js";
import { cfg } from "./env.js";

const adapter = new PrismaPg({ connectionString: cfg.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
