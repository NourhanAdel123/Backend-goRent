import User from "../../DB/Models/user.model.js";
import Property from "../../DB/Models/property.model.js";
import Booking from "../../DB/Models/booking.model.js";
import Dispute from "../../DB/Models/dispute.model.js";
import Review from "../../DB/Models/review.model.js";

export const getPlatformReport = async (req,res,next) =>{
    try {
        const [
            totalUsers,
            totalOwners,
            totalTenants,
            totalProperties,
            approvedProperties,
            pendingProperties,
            totalBookings,
            revenueAgg,
            openDisputes,
            resolvedDisputes,
            ratingAgg,
            topPropertiesAgg,
        ] = await Promise.all([

        User.countDocuments({}),
        User.countDocuments({ role: "owner" }),
        User.countDocuments({role:"tenant"}),
        Property.countDocuments({}),
        Property.countDocuments({status:"APPROVED"}),
        Property.countDocuments({status:"PENDING"}),
        Booking.countDocuments({ status: { $ne: "CANCELLED" } }),
        Booking.aggregate([
                { $match: { status: { $ne: "CANCELLED" } } },
                { $group: { _id: null, total: { $sum: "$amountPaid" } } },
                ]),
        Dispute.countDocuments({ status: { $in: ["OPEN", "IN_REVIEW"] } }),
        Dispute.countDocuments({ status: { $in: ["RESOLVED", "REJECTED"] } }),
        Review.aggregate([
                { $group: { _id: null, average: { $avg: "$rating" } } },
            ]),
        Booking.aggregate([
                { $match: { status: { $ne: "CANCELLED" } } },
                {
                    $group: {
                        _id: "$propertyId",
                        bookings: { $sum: 1 },
                        revenue: { $sum: "$amountPaid" },
                    },
                },
                { $sort: { revenue: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: "properties",
                        localField: "_id",
                        foreignField: "_id",
                        as: "property",
                    },
                },
                { $unwind: "$property" },
                {
                    $project: {
                        _id: 0,
                        title: "$property.title",
                        bookings: 1,
                        revenue: 1,
                    },
                },
            ]),
        ]);
        const totalRevenue = revenueAgg[0]?.total || 0;
        const averageRating = ratingAgg[0]?.average ? Math.round(ratingAgg[0].average * 10) / 10 : 0;

        return res.status(200).json({
            report:{
            totalUsers,
            totalOwners,
            totalTenants,
            totalProperties,
            approvedProperties,
            pendingProperties,
            totalBookings,
            totalRevenue,
            openDisputes,
            resolvedDisputes,
            averageRating,
            topProperties: topPropertiesAgg,
        }
        })

    }
    catch (error) {return next(error)}
}
