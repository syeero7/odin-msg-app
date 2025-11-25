import { Router } from "express";

const router = Router();

router.get("/");
router.post("/");

router.get("/:groupId");

router.get("/:groupId/members");
router.get("/:groupId/nonmembers");
router.put("/:groupId/members/:userId"); // action="remove" || "add"
router.delete("/:groupId");

export default router;
