import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  CSRF_SECRET: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  BACKEND_URL: z.string().min(1),
  FRONTEND_URL: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  PORT: z.string().min(1),
  GUEST_USERNAME: z.string().min(1),
});

export const cfg = envSchema.parse(process.env);
