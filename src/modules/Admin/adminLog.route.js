import { Router } from "express";
import * as AC from "./adminLog.controller.js";
import { verifyAuth, verifyRole } from "../../Middleware/Auth.Middleware.js";

const router = Router();

router.get(
  "/",
  verifyAuth,
  verifyRole(["superadmin"]),
  AC.getLogs
);

export default router;
