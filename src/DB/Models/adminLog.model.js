import mongoose from "mongoose";
const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "APPROVE_LISTING",
        "REJECT_LISTING",
        "BAN_USER",
        "UNBAN_USER",
        "RESOLVE_DISPUTE",
      ],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["PROPERTY", "USER", "BOOKING"],
      required: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

adminLogSchema.index({ adminId: 1, createdAt: -1 });
adminLogSchema.index({ targetId: 1, targetType: 1, createdAt: -1 });

const AdminLog = mongoose.model("AdminLog", adminLogSchema);

module.exports = AdminLog;
