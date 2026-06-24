import express from "express";
import { verifyRole } from "../../Middleware/Auth.Middleware.js";
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
    getAdminProperties
} from "./property.controller.js";

const router = express.Router();

router.get("/", getProperties);
router.get("/admin/properties", verifyRole(["admin","superadmin"]), getAdminProperties);
router.get("/get/owner", verifyRole(["owner"]), getPropertbyOwnerId);
router.get("/owner/dashboard", verifyRole(["owner"]), getOwnerDashboard);
router.get("/:id", getPropertyById);

router.post("/", verifyRole(["owner"]), upload.array("images", 10), createProperty);

router.put("/:id", verifyRole(["owner"]), upload.array("images", 10), updateProperty);
router.patch("/:id/approve", verifyRole(["admin"]), approveProperty);
router.patch("/:id/reject", verifyRole(["admin"]), rejectProperty);

router.delete("/:id", verifyRole(["owner"]), deleteProperty);

export default router;
