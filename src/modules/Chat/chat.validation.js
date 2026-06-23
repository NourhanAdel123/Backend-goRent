export const validateCreateThread = (req, res, next) => {
  const { propertyId } = req.body;

  if (!propertyId) {
    return res.status(400).json({ message: "propertyId is required" });
  }

  next();
};

export const validateSendMessage = (req, res, next) => {
  const text = req.body.text?.trim();

  if (!text && !req.file) {
    return res
      .status(400)
      .json({ message: "Message text or attachment is required" });
  }

  if (text && text.length > 2000) {
    return res
      .status(400)
      .json({ message: "Message must be 2000 characters or fewer" });
  }

  req.body.text = text || "";
  next();
};
