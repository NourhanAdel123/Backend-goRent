import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatThread",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    attachmentUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["SENT", "DELIVERED", "SEEN"],
      default: "SENT",
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    seenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ threadId: 1, createdAt: -1 });
messageSchema.index({ threadId: 1, senderId: 1, status: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
