import mongoose from "mongoose";

const chatThreadSchema = new mongoose.Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
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

// Compound index to quickly find threads between a specific tenant and owner regarding a property
chatThreadSchema.index(
  { tenantId: 1, ownerId: 1, propertyId: 1 },
  { unique: true },
);

chatThreadSchema.index({ lastMessageAt: -1 });

const ChatThread = mongoose.model("ChatThread", chatThreadSchema);

export default ChatThread;
