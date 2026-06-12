import Review from "../../DB/Models/review.model.js";
import Property from "../../DB/Models/property.model.js";
import mongoose from "mongoose";

const createReview = async (req, res) => {
  try {
    const { targetType, propertyId, targetUserId, rating, comment } = req.body;

    const authorId = req.user.id;

    const allowedTypes = ["PROPERTY", "OWNER", "TENANT"];

    if (!targetType || !allowedTypes.includes(targetType)) {
      return res.status(400).json({
        message: "targetType must be PROPERTY, OWNER, or TENANT",
      });
    }

    if (rating === undefined || rating === null) {
      return res.status(400).json({ message: "rating is required" });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "rating must be an integer between 1 and 5",
      });
    }

    let property = null;

    if (targetType === "PROPERTY") {
      if (!propertyId) {
        return res.status(400).json({
          message: "propertyId is required for PROPERTY review",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({ message: "Invalid propertyId" });
      }

      property = await Property.findById(propertyId);

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      if (property.status !== "APPROVED") {
        return res.status(400).json({
          message: "Cannot review a non-approved property",
        });
      }

      if (property.ownerId.toString() === authorId) {
        return res.status(403).json({
          message: "You cannot review your own property",
        });
      }

      const existing = await Review.findOne({
        authorId,
        targetUserId,
        targetType,
      });

      if (existing) {
        return res.status(409).json({
          message: "You already reviewed this property",
        });
      }
    }

    if (targetType === "OWNER" || targetType === "TENANT") {
      if (!targetUserId) {
        return res.status(400).json({
          message: "targetUserId is required for user review",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        return res.status(400).json({
          message: "Invalid targetUserId",
        });
      }

      if (targetUserId === authorId) {
        return res.status(403).json({
          message: "You cannot review yourself",
        });
      }

      const existing = await Review.findOne({
        authorId,
        targetUserId,
        targetType,
      });

      if (existing) {
        return res.status(409).json({
          message: "You already reviewed this user",
        });
      }
    }

    const review = new Review({
      authorId,
      targetType,
      propertyId: targetType === "PROPERTY" ? propertyId : null,
      targetUserId:
        targetType === "OWNER" || targetType === "TENANT" ? targetUserId : null,
      rating,
      comment: comment || "",
    });

    await review.save();

    return res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export { createReview };
