import { Router } from "express";
import * as RC from "./report.controller.js";
import { verifyAuth, verifyRole } from "../../Middleware/Auth.Middleware.js";

const router = Router();

router.get(
  "/",
  verifyAuth,
  verifyRole(["admin", "superadmin"]),
  RC.getPlatformReport,
);

export default router;
