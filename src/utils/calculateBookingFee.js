const NIGHTS_PER_MONTH = 30;

export const LISTING_FEE_EGP = 100;


const calculateTotalStayValue = (nights, { pricePerDay, pricePerMonth }) => {
    const dailyRate = pricePerDay ?? pricePerMonth / NIGHTS_PER_MONTH

    if (nights < NIGHTS_PER_MONTH) {
        return nights * dailyRate
    }

    const fullMonths = Math.floor(nights / NIGHTS_PER_MONTH)
    const remainingDays = nights % NIGHTS_PER_MONTH

    return fullMonths * pricePerMonth + remainingDays * dailyRate
}

export const calculateBookingFeeEGP = (startDate, endDate, property) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const oneDayMs = 24 * 60 * 60 * 1000

    const nights = Math.round((end - start) / oneDayMs)
    if (nights <= 0) {
        throw new Error("endDate must be after startDate")
    }

    const totalStayValue = calculateTotalStayValue(nights, property)
    const fee = totalStayValue * 0.10

    return Math.round(fee * 100) / 100
}