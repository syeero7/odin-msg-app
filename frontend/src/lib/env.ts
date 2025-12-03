import z from "zod";

const envSchema = z.object({
  VITE_BACKEND_URL: z.string().min(1),
});

export const cfg = envSchema.parse(import.meta.env);
