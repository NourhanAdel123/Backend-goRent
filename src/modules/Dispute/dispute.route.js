import { Router } from "express";
const router = Router();
import { verifyRole, verifyAuth } from "../../Middleware/Auth.Middleware.js";
import { validateCreateDispute } from "./dispute.validation.js";
import * as DC from "./dispute.controller.js";

router.post("/", verifyRole(["tenant","owner"]), validateCreateDispute, DC.createDispute);
router.get("/", verifyRole(["admin"]), DC.getDisputes);
router.get("/my", verifyAuth, DC.getMyDisputes);
router.get("/:id", verifyRole(["admin"]), DC.getDisputeById);
router.patch("/:id/review", verifyRole(["admin"]), DC.markDisputeInReview);
router.patch("/:id/resolve", verifyRole(["admin"]), DC.resolveDispute);
router.patch("/:id/reject", verifyRole(["admin"]), DC.rejectDispute);
router.delete("/:id", verifyAuth,verifyRole(["admin","superadmin"]), DC.deleteDispute);

export default router;