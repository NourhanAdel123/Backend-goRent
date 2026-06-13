import { Router } from "express";
import { login, register, logout, getCurrentUser } from "./auth.controller.js";
import { verifyRole, verifyAuth } from "../../Middleware/Auth.Middleware.js";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", verifyAuth, getCurrentUser);
export default router;
