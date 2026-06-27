import { Router } from "express";
import * as ReviewController from "./reviews.controller.js";
import { verifyRole, verifyAuth } from "../../Middleware/Auth.Middleware.js";

const router = Router();

router.get("/", ReviewController.getReviews);

router.post(
  "/",
  verifyAuth,
  verifyRole(["tenant", "owner", "admin"]),
  ReviewController.createReview,
);
router.patch(
  "/:id",
  verifyAuth,
  verifyRole(["tenant", "owner", "admin"]),
  ReviewController.updateReview,
);

router.delete(
  "/:id",
  verifyAuth,
  verifyRole(["tenant", "owner", "admin"]),
  ReviewController.deleteReview,
);

export default router;
