import { Router } from "express";
import * as auth from "@/handlers/auth.js";

const router = Router();

router.get("/github", auth.githubSignin);
router.get("/github/callback", auth.githubCallback);
// router.get("/guest");

export default router;
