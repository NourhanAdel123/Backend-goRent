export const validateCreateUser = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, and password are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  next();
};

export const validateUpdateUser = (req, res, next) => {
  const { name, phone, role } = req.body;
  const hasBodyUpdate =
    name !== undefined || phone !== undefined || role !== undefined;
  const hasFileUpdate = req.files && req.files.length > 0;

  if (!hasBodyUpdate && !hasFileUpdate) {
    return res.status(400).json({ message: "No fields provided to update" });
  }

  const allowedRoles = ["tenant", "owner", "admin", "superadmin"];
  if (role !== undefined && !allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  next();
};
