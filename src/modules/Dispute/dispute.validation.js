export const validateCreateDispute = (req, res, next) => {
    const {propertyId, subject, description} = req.body;

    if(!propertyId){return next(new Error("Property ID is required"))}
    if(!subject || !subject.trim()){return next(new Error("Subject is required"))}
    if(subject.trim().length > 150){return next(new Error("Subject must be 150 characters or less"))}
    if(!description || !description.trim()){return next(new Error("Description is required"))}

    next()
};