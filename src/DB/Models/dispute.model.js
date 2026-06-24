import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
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
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"],
            default: "OPEN",
        },
        resolution: {}
    }, { timestamps: true }

);
disputeSchema.index({ status: 1, createdAt: -1 });
disputeSchema.index({ tenantId: 1, createdAt: -1 });
disputeSchema.index({ ownerId: 1, createdAt: -1 });
disputeSchema.index({ propertyId: 1 });

const Dispute = mongoose.model("Dispute", disputeSchema);

export default Dispute;
