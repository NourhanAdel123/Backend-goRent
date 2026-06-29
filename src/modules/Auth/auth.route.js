import { Router } from "express";
import {
  login,
  register,
  logout,
  getCurrentUser,
  getSocketToken,
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "./auth.controller.js";
import { verifyRole, verifyAuth } from "../../Middleware/Auth.Middleware.js";
import { upload } from "../../utils/cloudinary.js";
const router = Router();

router.post("/register", upload.any(), register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", verifyAuth, getCurrentUser);
router.get("/socket-token", verifyAuth, getSocketToken);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router;
