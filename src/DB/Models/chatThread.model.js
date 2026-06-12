import mongoose from "mongoose";

const chatThreadSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

chatThreadSchema.index(
  { tenantId: 1, ownerId: 1, propertyId: 1 },
  { unique: true },
);

chatThreadSchema.index({ lastMessageAt: -1 });

const ChatThread = mongoose.model("ChatThread", chatThreadSchema);

export default ChatThread;
