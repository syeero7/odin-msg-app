import { Router } from "express";
import * as handlers from "@/handlers/groups.js";

const router = Router();

router.get("/", handlers.getUserGroups);
router.post("/", handlers.createGroup);

router.get("/:groupId", handlers.getGroupById);

router.get("/:groupId/members", handlers.getGroupMembers);
router.get("/:groupId/nonmembers", handlers.getGroupNonmembers);
router.put("/:groupId/members/:userId", handlers.updateGroupMembers); // action="remove" || "add"
router.delete("/:groupId", handlers.deleteGroupById);

export default router;
