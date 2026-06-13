import User from "../../DB/Models/user.model.js";
import JWT from "jsonwebtoken";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export { login, register };
