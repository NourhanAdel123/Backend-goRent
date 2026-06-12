import { Router } from "express";
import * as ReviewController from "./reviews.controller.js";
import { verifyRole } from "../../Middleware/Auth.Middleware.js";

const router = Router();

router.get("/", ReviewController.getReviews);

router.post(
  "/",
  verifyRole(["tenant", "owner", "admin"]),
  ReviewController.createReview,
);

router.delete(
  "/:id",
  verifyRole(["tenant", "owner", "admin"]),
  ReviewController.deleteReview,
);

export default router;
