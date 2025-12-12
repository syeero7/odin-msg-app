import { Router } from "express";
import * as handlers from "@/handlers/assets.js";

const router = Router();

router.post("/images", handlers.uploadImage);

export default router;
