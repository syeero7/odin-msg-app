import { Router } from "express";
import * as handlers from "@/handlers/users.js";

const router = Router();

router.get("/", handlers.getUsers);
router.get("/:userId", handlers.getUserById);
router.put("/", handlers.updateUser);

export default router;
