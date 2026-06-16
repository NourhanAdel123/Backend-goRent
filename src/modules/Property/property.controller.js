import mongoose from "mongoose";
import Property from "../../DB/Models/property.model.js";
import { logAdminAction } from "../Admin/adminLog.controller.js";

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
};

const buildPropertyFilter = (query) => {
  const filter = { status: "APPROVED" };
  const type =
    typeof query.type === "string" ? query.type.toUpperCase() : undefined;
  const minPrice = parseNumber(query.minPrice);
  const maxPrice = parseNumber(query.maxPrice);
  const minSize = parseNumber(query.minSize);
  const maxSize = parseNumber(query.maxSize);
  const bedrooms = parseNumber(query.bedrooms);
  const bathrooms = parseNumber(query.bathrooms);
  const lng = parseNumber(query.lng);
  const lat = parseNumber(query.lat);
  const radius = parseNumber(query.radius);

  if (type) {
    filter.type = type;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.pricePerMonth = {};

    if (minPrice !== undefined) {
      filter.pricePerMonth.$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      filter.pricePerMonth.$lte = maxPrice;
    }
  }

  if (minSize !== undefined || maxSize !== undefined) {
    filter.squareFootage = {};

    if (minSize !== undefined) {
      filter.squareFootage.$gte = minSize;
    }

    if (maxSize !== undefined) {
      filter.squareFootage.$lte = maxSize;
    }
  }

  if (bedrooms !== undefined) {
    filter["specifications.apartment.bedrooms"] = bedrooms;
  }

  if (bathrooms !== undefined) {
    filter["specifications.apartment.bathrooms"] = bathrooms;
  }

  if (lng !== undefined || lat !== undefined || radius !== undefined) {
    if (lng === undefined || lat === undefined || radius === undefined) {
      return {
        error: "lng, lat, and radius are required together for geo search",
      };
    }

    filter.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: radius,
      },
    };
  }

  return { filter };
};

export const createProperty = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const {
      type,
      title,
      description,
      pricePerMonth,
      squareFootage,
      location,
      specifications,
      isAvailable,
    } = req.body;

    const property = await Property.create({
      ownerId,
      type,
      title,
      description,
      pricePerMonth,
      squareFootage,
      location,
      specifications,
      isAvailable,
      status: "PENDING",
    });

    return res.status(201).json({
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    return next(error);
  }
};

export const getProperties = async (req, res, next) => {
  try {
    const page = Math.max(parseNumber(req.query.page) || 1, 1);
    const limit = Math.max(parseNumber(req.query.limit) || 10, 1);
    const { filter, error } = buildPropertyFilter(req.query);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const query = Property.find(filter).populate(
      "ownerId",
      "name email phone profileImage",
    );

    if (!filter.location) {
      query.sort({ createdAt: -1 });
    }

    // countDocuments does not support $near, so we replace it with $geoWithin
    // using $centerSphere (converted from meters to radians) for the count query.
    const countFilter = { ...filter };
    if (countFilter.location && countFilter.location.$near) {
      countFilter.location = {
        $geoWithin: {
          $centerSphere: [
            filter.location.$near.$geometry.coordinates,
            filter.location.$near.$maxDistance / 6378100, // Earth's equatorial radius in meters
          ],
        },
      };
    }

    const [properties, totalItems] = await Promise.all([
      query.skip((page - 1) * limit).limit(limit),
      Property.countDocuments(countFilter),
    ]);

    return res.status(200).json({
      properties,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    // return res.status(500).json({
    //   message: "Server error",
    //   error: error.message,
    // });
    return next(error);
  }
};

export const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // return res.status(400).json({ message: "Invalid property id" });

      return next(new Error("Invalid property id", { cause: 400 }));
    }

    const property = await Property.findOne({
      _id: id,
      status: "APPROVED",
    }).populate("ownerId", "name email phone profileImage");

    if (!property) {
      // return res.status(404).json({ message: "Property not found" });

      return next(new Error("Property not found", { cause: 404 }));
    }

    return res.status(200).json({ property });
  } catch (error) {
    // return res.status(500).json({
    //   message: "Server error",
    //   error: error.message,
    // });
    return next(error);
  }
};

export const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // return res.status(400).json({ message: "Invalid property id" });

      return next(new Error("Invalid property id", { cause: 400 }));
    }

    const property = await Property.findById(id);

    if (!property) {
      // return res.status(404).json({ message: "Property not found" })
      //

      return next(new Error("Property not found", { cause: 404 }));
    }

    if (property.ownerId.toString() !== userId.toString()) {
      // return res.status(403).json({ message: "Not authorized" });

      return next(new Error("Not authorized", { cause: 403 }));
    }

    const updatableFields = [
      "type",
      "title",
      "description",
      "pricePerMonth",
      "squareFootage",
      "location",
      "specifications",
      "isAvailable",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    await property.save();

    return res.status(200).json({
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    // return res.status(500).json({
    //   message: "Server error",
    //   error: error.message,
    // });
    return next(error);
  }
};

export const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // return res.status(400).json({ message: "Invalid property id" });
      return next(new Error("Invalid property id", { cause: 400 }));
    }

    const property = await Property.findById(id);

    if (!property) {
      // return res.status(404).json({ message: "Property not found" });
      return next(new Error("Property not found", { cause: 404 }));
    }

    if (property.ownerId.toString() !== userId.toString()) {
      // return res.status(403).json({ message: "Not authorized" });
      return next(new Error("Not authorized", { cause: 403 }));
    }

    await Property.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    // return res.status(500).json({
    //   message: "Server error",
    //   error: error.message,
    // });
    return next(error);
  }
};

export const approveProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // return res.status(400).json({ message: "Invalid property id" });
      return next(new Error("Invalid property id", { cause: 400 }));
    }

    const property = await Property.findById(id);

    if (!property) {
      // return res.status(404).json({ message: "Property not found" });
      return next(new Error("Property not found", { cause: 404 }));
    }

    property.status = "APPROVED";
    property.reviewedBy = req.user.id;
    property.reviewedAt = new Date();

    await property.save();

    await logAdminAction({
      adminId: req.user.id,
      action: "APPROVE_LISTING",
      targetId: id,
      targetType: "PROPERTY",
    });

    return res.status(200).json({
      message: "Property approved successfully",
      property,
    });
  } catch (error) {
    // return res.status(500).json({
    //   message: "Server error",
    //   error: error.message,
    // });
    return next(error);
  }
};

export const rejectProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // return res.status(400).json({ message: "Invalid property id" });
      return next(new Error("Invalid property id", { cause: 400 }));
    }

    const property = await Property.findById(id);

    if (!property) {
      // return res.status(404).json({ message: "Property not found" });
      return next(new Error("Property not found", { cause: 404 }));
    }

    property.status = "REJECTED";
    property.reviewedBy = req.user.id;
    property.reviewedAt = new Date();

    await property.save();

    await logAdminAction({
      adminId: req.user.id,
      action: "REJECT_LISTING",
      targetId: id,
      targetType: "PROPERTY",
    });

    return res.status(200).json({
      message: "Property rejected successfully",
      property,
    });
  } catch (error) {
    // return res.status(500).json({
    //   message: "Server error",
    //   error: error.message,
    // });
    return next(error);
  }
};
