import { Router } from "express";
import * as handlers from "@/handlers/auth.js";

const router = Router();

router.get("/github", handlers.githubSignin);
router.get("/github/callback", handlers.githubCallback);
// router.get("/guest");

export default router;
