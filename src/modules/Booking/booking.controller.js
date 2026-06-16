import Booking from "../../DB/Models/booking.model.js";
import Property from "../../DB/Models/property.model.js";
import User from "../../DB/Models/user.model.js";

export const createBooking = async (req, res, next) => {
  try {
    const { propertyId, startDate, endDate } = req.body;
    const tenantId = req.user.id;

    const property = await Property.findById(propertyId);

    if (!property) {
      // return res.status(404).json({ message: "Property not found" })
      return next(new Error("Property not found", { cause: 404 }));
    }

    if (property.status !== "APPROVED") {
      // return res.status(400).json({ message: "Property is not available for booking" })
      return next(
        new Error("Property is not available for booking", { cause: 400 }),
      );
    }

    const conflict = await Booking.findOne({
      propertyId,
      status: { $ne: "CANCELLED" },
      startDate: { $lt: new Date(endDate) },
      endDate: { $gt: new Date(startDate) },
    });

    if (conflict) {
      //   return res
      //     .status(400)
      //     .json({ message: "Property is already booked for these dates" });
      return next(
        new Error("Property is already booked for these dates", {
          cause: 400,
        }),
      );
    }

    const amountPaid = property.pricePerMonth;

    const booking = await Booking.create({
      propertyId,
      tenantId,
      startDate,
      endDate,
      amountPaid,
      stripePaymentIntentId: `MOCK_${Date.now()}`,
      status: "PENDING_PAYMENT",
    });

    return res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.id;

    const booking = await Booking.findById(id);

    if (!booking) {
      //   return res.status(404).json({ message: "Booking not found" });
      return next(new Error("Booking not found", { cause: 404 }));
    }

    if (booking.tenantId.toString() !== tenantId.toString()) {
      //   return res.status(403).json({ message: "Not authorized" });
      return next(new Error("Not authorized", { cause: 403 }));
    }

    if (booking.status === "CANCELLED") {
      //   return res.status(400).json({ message: "Booking already cancelled" });
      return next(new Error("Booking already cancelled", { cause: 400 }));
    }

    booking.status = "CANCELLED";
    await booking.save();

    const user = await User.findById(tenantId);

    user.cancellationCount += 1;

    if (user.cancellationCount >= 3) {
      user.isBanned = true;
    }

    await user.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    return next(error);
  }
};
export const getTenantBookings = async (req, res) => {
  try {
    const tenantId = req.user.id;

    const bookings = await Booking.find({ tenantId })
      .populate("propertyId", "title pricePerMonth location")
      .sort({ createdAt: -1 });

    return res.status(200).json({ bookings });
  } catch (error) {
    next(error);
  }
};
export const getPropertyBookings = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const bookings = await Booking.find({ propertyId })
      .populate("tenantId", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({ bookings });
  } catch (error) {
    next(error);
  }
};
