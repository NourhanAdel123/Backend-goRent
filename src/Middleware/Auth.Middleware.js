import jwt from "jsonwebtoken";

// export const verifyTenant = (req, res, next) => {
//   console.log(req.cookies.token);

//   const token = req.cookies.token;
//   if ((token = undefined)) {
//     res.status(500).json("Token is missing ");
//   }
//   const { role } = jwt.decode(token);
//   console.log(role);
//   if (role === "tenant") {
//     next();
//   } else {
//     res.status(403).json(`User role : ${role} is not Authorized`);
//   }
// };

// export const verifyOwner = (req, res, next) => {
//   console.log(req.cookies.token);

//   const token = req.cookies.token;
//   if ((token = undefined)) {
//     res.status(500).json("Token is missing ");
//   }
//   const { role } = jwt.decode(token);
//   console.log(role);
//   if (role === "owner") {
//     next();
//   } else {
//     res.status(403).json(`User role : ${role} is not Authorized`);
//   }
// };

// export const verifyAdmin = (req, res, next) => {
//   console.log(req.cookies.token);

//   const token = req.cookies.token;
//   if ((token = undefined)) {
//     res.status(500).json("Token is missing ");
//   }
//   const { role } = jwt.decode(token);
//   console.log(role);
//   if (role === "admin") {
//     next();
//   } else {
//     res.status(403).json(`User role : ${role} is not Authorized`);
//   }
// };

// export const verifySuperAdmin = (req, res, next) => {
//   console.log(req.cookies.token);

//   const token = req.cookies.token;
//   if ((token = undefined)) {
//     res.status(500).json("Token is missing ");
//   }
//   const { role } = jwt.decode(token);
//   console.log(role);
//   if (role === "superadmin") {
//     next();
//   } else {
//     res.status(403).json(`User role : ${role} is not Authorized`);
//   }
// };

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
