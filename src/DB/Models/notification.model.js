import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "NEW_MESSAGE",
        "BOOKING_CONFIRMED",
        "VIEWING_REQUEST",
        "VIEWING_ACCEPTED",
        "LISTING_APPROVED",
        "LISTING_REJECTED",
        "NEW_REVIEW",
      ],
      required: true,
    },
    // Generic reference ID pointing to the source document (e.g., Message ID, Booking ID, Property ID)
    refId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  },
);

notificationSchema.index({ userId: 1, isArchived: 1, isRead: 1 });

notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;