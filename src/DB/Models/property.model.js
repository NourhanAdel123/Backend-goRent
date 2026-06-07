import mongoose from "mongoose";

const propertySchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["RESIDENTIAL", "COMMERCIAL"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    pricePerMonth: {
      type: Number,
      required: true,
      min: 0,
    },
    squareFootage: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    // GeoJSON Point format for 2dsphere indexing
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    // Flattened or nested specifications grouped by type
    specifications: {
      apartment: {
        bedrooms: { type: Number, default: null },
        bathrooms: { type: Number, default: null },
        hasElevator: { type: Boolean, default: null },
      },
      shop: {
        electricityCapacity: { type: Number, default: null },
        footTrafficTier: { type: String, default: null },
        commercialLicenseRequired: { type: Boolean, default: null },
      },
    },
  },
  {
    timestamps: true,
  },
);

// 2dsphere index for location-based queries (distance, geoWithin, etc.)
propertySchema.index({ location: "2dsphere" });

const Property = mongoose.model("Property", propertySchema);
