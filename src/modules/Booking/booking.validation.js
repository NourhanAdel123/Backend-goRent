export const validateCreateBooking = (req, res, next) => {
    const { propertyId, startDate, endDate } = req.body


    if (!propertyId) {
        return res.status(400).json({ message: "propertyId is required" })
    }


    if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" })
    }


    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ message: "Invalid dates" })
    }


    if (start < new Date()) {
        return res.status(400).json({ message: "startDate cannot be in the past" })
    }


    if (start >= end) {
        return res.status(400).json({ message: "startDate must be before endDate" })
    }

    next()
}