import express from "express";
import { verifyRole } from "../../Middleware/Auth.Middleware.js";
import { banUser, unbanUser } from "./user.controller.js";

const router = express.Router();

router.patch("/:id/ban", verifyRole(["admin"]), banUser);
router.patch("/:id/unban", verifyRole(["admin"]), unbanUser);

export default router;
