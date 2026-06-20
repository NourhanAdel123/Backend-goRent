import User from "../../DB/Models/user.model.js";
import JWT from "jsonwebtoken";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new Error("Email and password are required", { cause: 400 }));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return next(new Error("User not found", { cause: 404 }));
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new Error("Invalid credentials", { cause: 400 }));
    }
    const token = JWT.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    return next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return next(
        new Error("Name, email, and password are required", { cause: 400 }),
      );
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new Error("User already exists", { cause: 400 }));
    }

    let profileImage = "";
    const uploadedFile = req.files?.[0];

    if (uploadedFile) {
      try {
        profileImage = await uploadToCloudinary(uploadedFile, "gorent/users");
      } catch (err) {
        console.error("Failed to upload profile image:", err);
        return res.status(500).json({
          message: "Server error",
          error: err.message || "Cloudinary upload failed",
          http_code: err.http_code || null,
        });
      }
    }

    const user = new User({ name, email, password, role, profileImage });
    await user.save();
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    // return res.status(500).json({
    //   message: "Server error",
    //   error: error.message,
    // });
    return next(error);
  }
};
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      // return res.status(404).json({
      //   message: "User not found",
      // });
      return next(new Error("User not found", { cause: 404 }));
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    // return res.status(500).json({
    //   message: "Server error",
    //   error: error.message,
    // });
    return next(error);
  }
};
export { login, register, logout, getCurrentUser };
