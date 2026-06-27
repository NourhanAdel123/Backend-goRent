import express from "express";
import { verifyRole, verifyAuth } from "../../Middleware/Auth.Middleware.js";
import { upload } from "../../utils/cloudinary.js";
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  approveProperty,
  rejectProperty,
  getPropertbyOwnerId,
  getOwnerDashboard,
  getAdminProperties,
} from "./property.controller.js";

const router = express.Router();

router.get("/", getProperties);
router.get(
  "/admin/properties",
  verifyAuth,
  verifyRole(["admin", "superadmin"]),
  getAdminProperties,
);
router.get(
  "/get/owner",
  verifyAuth,
  verifyRole(["owner"]),
  getPropertbyOwnerId,
);
router.get(
  "/owner/dashboard",
  verifyAuth,
  verifyRole(["owner"]),
  getOwnerDashboard,
);
router.get("/:id", getPropertyById);

router.post(
  "/",
  verifyAuth,
  verifyRole(["owner"]),
  upload.array("images", 10),
  createProperty,
);

router.put(
  "/:id",
  verifyAuth,
  verifyRole(["owner"]),
  upload.array("images", 10),
  updateProperty,
);
router.patch(
  "/:id/approve",
  verifyAuth,
  verifyRole(["admin"]),
  approveProperty,
);
router.patch("/:id/reject", verifyAuth, verifyRole(["admin"]), rejectProperty);

router.delete("/:id", verifyAuth, verifyRole(["owner"]), deleteProperty);

export default router;
