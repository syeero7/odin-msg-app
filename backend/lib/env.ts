import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  CSRF_SECRET: z.string(),
  JWT_SECRET: z.string(),
  BACKEND_URL: z.string(),
  FRONTEND_URL: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  PORT: z.string(),
  GUEST_USERNAME: z.string(),
});

export const cfg = envSchema.parse(process.env);
