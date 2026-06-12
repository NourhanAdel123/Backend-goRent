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

const getReviews = async (req, res) => {
  try {
    const { targetType, propertyId, targetUserId } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by targetType if provided
    if (targetType) {
      const allowedTypes = ["PROPERTY", "OWNER", "TENANT"];
      if (!allowedTypes.includes(targetType)) {
        return res.status(400).json({
          message: "targetType must be PROPERTY, OWNER, or TENANT",
        });
      }
      filter.targetType = targetType;
    }

    // Filter by propertyId if provided
    if (propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({ message: "Invalid propertyId" });
      }
      filter.propertyId = propertyId;
    }

    // Filter by targetUserId if provided
    if (targetUserId) {
      if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        return res.status(400).json({ message: "Invalid targetUserId" });
      }
      filter.targetUserId = targetUserId;
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("authorId", "name profileImage")
        .populate("propertyId", "title images")
        .populate("targetUserId", "name profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    return res.status(200).json({
      message: "Reviews fetched successfully",
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only the author can delete their own review
    if (review.authorId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to delete this review",
      });
    }

    await Review.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export { createReview, getReviews, deleteReview };
