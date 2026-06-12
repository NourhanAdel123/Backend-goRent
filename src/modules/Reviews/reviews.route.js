import { Router } from "express";
import * as ReviewController from "./reviews.controller.js";
import { verifyRole } from "../../Middleware/Auth.Middleware.js";

const router = Router();

router.post(
  "/",
  verifyRole(["tenant", "owner", "admin"]),
  ReviewController.createReview,
);

export default router;
