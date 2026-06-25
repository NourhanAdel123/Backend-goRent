import { Router } from "express";
import {
    initiateListingFeePayment,
    initiateBookingFeePayment,
} from "./payment.controller.js";
import { verifyAuth, verifyRole } from "../../Middleware/Auth.Middleware.js";

const router = Router();

// Owner pays 100 EGP to publish a property.
router.post(
    "/listing-fee/:propertyId",
    verifyAuth,
    verifyRole(["owner"]),
    initiateListingFeePayment,
);

// Tenant pays 10% booking fee after the owner accepted the booking.
router.post(
    "/booking-fee/:bookingId",
    verifyAuth,
    verifyRole(["tenant"]),
    initiateBookingFeePayment,
);

export default router;