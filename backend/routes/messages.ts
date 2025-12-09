import { Router } from "express";
import * as handlers from "@/handlers/messages.js";

const router = Router();

router.get("/direct", handlers.getDirectMessages);
router.get("/group", handlers.getGroupMessages);

export default router;
