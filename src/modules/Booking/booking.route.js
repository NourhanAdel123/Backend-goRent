import express from "express"
import { verifyRole,verifyAuth } from "../../Middleware/Auth.Middleware.js"
import { validateCreateBooking } from "./booking.validation.js"
import { createBooking, cancelBooking, getTenantBookings, getOwnerBookings, getPropertyBookings,acceptBooking,rejectBooking } from "./booking.controller.js"



const router = express.Router()


router.post("/", verifyRole(["tenant"]), validateCreateBooking, createBooking)
router.patch("/:id/cancel", verifyRole(["tenant"]), cancelBooking)
router.get("/tenant", verifyRole(["tenant"]), getTenantBookings)
router.get("/owner", verifyRole(["owner"]), getOwnerBookings)
router.get("/property/:propertyId", verifyRole(["owner", "admin"]), getPropertyBookings)



router.patch("/:id/accept", verifyAuth, verifyRole(["owner"]), acceptBooking);
router.patch("/:id/reject", verifyAuth, verifyRole(["owner"]), rejectBooking);

export default router