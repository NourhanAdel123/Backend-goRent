import express from "express";
import { verifyAuth, verifyRole } from "../../Middleware/Auth.Middleware.js";
import { upload } from "../../utils/cloudinary.js";
import {
  createOrGetThread,
  getMyThreads,
  getThreadMessages,
  sendMessage,
  markThreadAsRead,
} from "./chat.controller.js";
import {
  validateCreateThread,
  validateSendMessage,
} from "./chat.validation.js";

const router = express.Router();

router.use(verifyAuth, verifyRole(["tenant", "owner"]));

router.post("/threads", validateCreateThread, createOrGetThread);
router.get("/threads", getMyThreads);
router.get("/threads/:threadId/messages", getThreadMessages);
router.post(
  "/threads/:threadId/messages",
  upload.single("attachment"),
  validateSendMessage,
  sendMessage,
);
router.patch("/threads/:threadId/read", markThreadAsRead);

export default router;
