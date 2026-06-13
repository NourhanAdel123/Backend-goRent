import express from "express";
import { verifyRole } from "../../Middleware/Auth.Middleware.js";
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  approveProperty,
  rejectProperty,
} from "./property.controller.js";

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getPropertyById);

router.post("/", verifyRole(["owner"]), createProperty);

router.put("/:id", verifyRole(["owner"]), updateProperty);
router.patch("/:id/approve", verifyRole(["admin"]), approveProperty);
router.patch("/:id/reject", verifyRole(["admin"]), rejectProperty);

router.delete("/:id", verifyRole(["owner"]), deleteProperty);

export default router;
