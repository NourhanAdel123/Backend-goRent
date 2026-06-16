import Review from "../../DB/Models/review.model.js";
import Property from "../../DB/Models/property.model.js";
import mongoose from "mongoose";

const createReview = async (req, res, next) => {
  try {
    const { targetType, propertyId, targetUserId, rating, comment } = req.body;

    const authorId = req.user.id;

    const allowedTypes = ["PROPERTY", "OWNER", "TENANT"];

    if (!targetType || !allowedTypes.includes(targetType)) {
      // return res.status(400).json({
      //   message: "targetType must be PROPERTY, OWNER, or TENANT",
      // });
      return next(
        new Error("targetType must be PROPERTY, OWNER, or TENANT", {
          cause: 400,
        }),
      );
    }

    if (rating === undefined || rating === null) {
      // return res.status(400).json({ message: "rating is required" });
      return next(new Error("rating is required", { cause: 400 }));
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      // return res.status(400).json({
      //   message: "rating must be an integer between 1 and 5",
      // });
      return next(
        new Error("rating must be an integer between 1 and 5", { cause: 400 }),
      );
    }

    let property = null;

    if (targetType === "PROPERTY") {
      if (!propertyId) {
        // return res.status(400).json({
        //   message: "propertyId is required for PROPERTY review",
        // });
        return next(
          new Error("propertyId is required for PROPERTY review", {
            cause: 400,
          }),
        );
      }

      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        // return res.status(400).json({ message: "Invalid propertyId" });
        return next(new Error("Invalid propertyId", { cause: 400 }));
      }

      property = await Property.findById(propertyId);

      if (!property) {
        // return res.status(404).json({ message: "Property not found" });
        return next(new Error("Property not found", { cause: 404 }));
      }

      if (property.status !== "APPROVED") {
        // return res.status(400).json({
        //   message: "Cannot review a non-approved property",
        // });
        return next(
          new Error("Cannot review a non-approved property", { cause: 400 }),
        );
      }

      if (property.ownerId.toString() === authorId) {
        // return res.status(403).json({
        //   message: "You cannot review your own property",
        // });
        return next(
          new Error("You cannot review your own property", { cause: 403 }),
        );
      }

      const existing = await Review.findOne({
        authorId,
        targetUserId,
        targetType,
      });

      if (existing) {
        // return res.status(409).json({
        //   message: "You already reviewed this property",
        // });
        return next(
          new Error("You already reviewed this property", { cause: 409 }),
        );
      }
    }

    if (targetType === "OWNER" || targetType === "TENANT") {
      if (!targetUserId) {
        // return res.status(400).json({
        //   message: "targetUserId is required for user review",
        // });
        return next(
          new Error("targetUserId is required for user review", {
            cause: 400,
          }),
        );
      }

      if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        // return res.status(400).json({
        //   message: "Invalid targetUserId",
        // });
        return next(new Error("Invalid targetUserId", { cause: 400 }));
      }

      if (targetUserId === authorId) {
        // return res.status(403).json({
        //   message: "You cannot review yourself",
        // });
        return next(new Error("You cannot review yourself", { cause: 403 }));
      }

      const existing = await Review.findOne({
        authorId,
        targetUserId,
        targetType,
      });

      if (existing) {
        // return res.status(409).json({
        //   message: "You already reviewed this user",
        // });
        return next(
          new Error("You already reviewed this user", { cause: 409 }),
        );
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
    next(error);
  }
};

const getReviews = async (req, res, next) => {
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
        // return res.status(400).json({
        //   message: "targetType must be PROPERTY, OWNER, or TENANT",
        // });
        return next(
          new Error("targetType must be PROPERTY, OWNER, or TENANT", {
            cause: 400,
          }),
        );
      }
      filter.targetType = targetType;
    }

    // Filter by propertyId if provided
    if (propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        // return res.status(400).json({ message: "Invalid propertyId" });
        return next(new Error("Invalid propertyId", { cause: 400 }));
      }
      filter.propertyId = propertyId;
    }

    // Filter by targetUserId if provided
    if (targetUserId) {
      if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        // return res.status(400).json({ message: "Invalid targetUserId" });
        return next(new Error("Invalid targetUserId", { cause: 400 }));
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
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // return res.status(400).json({ message: "Invalid review ID" });
      return next(new Error("Invalid review ID", { cause: 400 }));
    }

    const review = await Review.findById(id);

    if (!review) {
      // return res.status(404).json({ message: "Review not found" });
      return next(new Error("Review not found", { cause: 404 }));
    }

    // Only the author can delete their own review
    if (review.authorId.toString() !== req.user.id) {
      // return res.status(403).json({
      //   message: "You are not authorized to delete this review",
      // });
      return next(
        new Error("You are not authorized to delete this review", {
          cause: 403,
        }),
      );
    }

    await Review.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // return res.status(400).json({
      //   message: "Invalid review ID",
      // });
      return next(new Error("Invalid review ID", { cause: 400 }));
    }

    const review = await Review.findById(id);

    if (!review) {
      // return res.status(404).json({
      //   message: "Review not found",
      // });
      return next(new Error("Review not found", { cause: 404 }));
    }

    if (review.authorId.toString() !== req.user.id) {
      // return res.status(403).json({
      //   message: "You are not authorized to edit this review",
      // });
      return next(
        new Error("You are not authorized to edit this review", {
          cause: 403,
        }),
      );
    }

    if (rating !== undefined) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        // return res.status(400).json({
        //   message: "rating must be an integer between 1 and 5",
        // });
        return next(
          new Error("rating must be an integer between 1 and 5", {
            cause: 400,
          }),
        );
      }

      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    await review.save();

    return res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

export { createReview, getReviews, deleteReview, updateReview };
