import express from "express";
import { verifyRole, verifyAuth } from "../../Middleware/Auth.Middleware.js";
import { validateCreateUser, validateUpdateUser } from "./user.validation.js";
import { upload } from "../../utils/cloudinary.js";
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, banUser, unbanUser, changePassword } from "./user.controller.js";

const router = express.Router();


router.get("/", verifyAuth, verifyRole(["admin"]), getAllUsers);
router.get("/:id", verifyAuth, getUserById);
router.post("/", verifyAuth, verifyRole(["admin"]), upload.any(), validateCreateUser, createUser);
router.put("/:id", verifyAuth, upload.any(), validateUpdateUser, updateUser);
router.delete("/:id", verifyAuth, verifyRole(["admin"]), deleteUser);
router.patch("/:id/ban", verifyAuth, verifyRole(["admin"]), banUser);
router.patch("/:id/unban", verifyAuth, verifyRole(["admin"]), unbanUser);
router.patch("/:id/change-password", verifyAuth, changePassword);

export default router;