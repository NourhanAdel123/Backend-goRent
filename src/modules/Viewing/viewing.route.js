import express from "express";
import { verifyRole, verifyAuth } from "../../Middleware/Auth.Middleware.js";
import { validateCreateViewing } from "./viewing.validation.js";
import {
  createViewing,
  acceptViewing,
  rejectViewing,
  completeViewing,
  getTenantViewings,
  getOwnerViewings,
} from "./viewing.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyAuth,
  verifyRole(["tenant"]),
  validateCreateViewing,
  createViewing,
);

router.patch("/:id/accept", verifyAuth, verifyRole(["owner"]), acceptViewing);
router.patch("/:id/reject", verifyAuth, verifyRole(["owner"]), rejectViewing);
router.patch(
  "/:id/complete",
  verifyAuth,
  verifyRole(["owner"]),
  completeViewing,
);

router.get("/tenant", verifyAuth, verifyRole(["tenant"]), getTenantViewings);
router.get("/owner", verifyAuth, verifyRole(["owner"]), getOwnerViewings);

export default router;
