import { Router } from "express";
import {
    initiateListingFeePayment,
    initiateBookingFeePayment,
} from "./payment.controller.js";
import { verifyAuth, verifyRole } from "../../Middleware/Auth.Middleware.js";

const router = Router();

router.post(
    "/listing-fee/:propertyId",
    verifyAuth,
    verifyRole(["owner"]),
    initiateListingFeePayment,
);

router.post(
    "/booking-fee/:bookingId",
    verifyAuth,
    verifyRole(["tenant"]),
    initiateBookingFeePayment,
);

export default router;