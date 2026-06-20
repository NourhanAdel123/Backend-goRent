import jwt from "jsonwebtoken";

export const verifyRole = (requiredRole) => {
  return (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access Denied: No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log(req.user);
      if (
        requiredRole.includes(decoded.role) ||
        decoded.role === "superadmin"
      ) {
        return next();
      } else {
        return res
          .status(403)
          .json({ message: `user role ${decoded.role} is not authorized` });
      }
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
export const verifyAuth = (req, res, next) => {
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};
