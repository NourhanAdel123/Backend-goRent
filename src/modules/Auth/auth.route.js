import { Router } from "express";
import { login, register } from "./auth.controller.js";
import { verifyRole } from "../../Middleware/Auth.Middleware.js";
import { upload } from "../../utils/cloudinary.js";
const router = Router();

router.post("/register", upload.any(), register);
router.post("/login", login);

export default router;
