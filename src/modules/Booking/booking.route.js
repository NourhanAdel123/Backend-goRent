import express from "express"
import { verifyRole } from "../../Middleware/Auth.Middleware.js"
import { validateCreateBooking } from "./booking.validation.js"
import { createBooking, cancelBooking, getTenantBookings, getPropertyBookings } from "./booking.controller.js"



const router = express.Router()


router.post("/", verifyRole(["tenant"]), validateCreateBooking, createBooking)
router.patch("/:id/cancel", verifyRole(["tenant"]), cancelBooking)
router.get("/tenant", verifyRole(["tenant"]), getTenantBookings)
router.get("/property/:propertyId", verifyRole(["owner", "admin"]), getPropertyBookings)

export default router