import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "RESERVED", "CANCELLED"],
      default: "PENDING_PAYMENT",
    },
    contractPdfUrl: {
      type: String,
      default: "",
    },
    signatures: {
      tenantSigned: {
        type: Boolean,
        default: false,
      },
      ownerSigned: {
        type: Boolean,
        default: false,
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ tenantId: 1, status: 1 });
bookingSchema.index({ propertyId: 1, startDate: 1, endDate: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;