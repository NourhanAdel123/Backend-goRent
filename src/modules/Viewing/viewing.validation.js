export const validateCreateViewing = (req, res, next) => {
    const { propertyId, scheduledAt } = req.body

    if (!propertyId) {
        return res.status(400).json({ message: "propertyId is required" })
    }

    if (!scheduledAt) {
        return res.status(400).json({ message: "scheduledAt is required" })
    }

    const date = new Date(scheduledAt);

    if (isNaN(date)) {
        return res.status(400).json({ message: "Invalid date" })
    }

    if (date < new Date()) {
        return res.status(400).json({ message: "scheduledAt cannot be in the past" })
    }

    next()
}