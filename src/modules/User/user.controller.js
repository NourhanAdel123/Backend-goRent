import mongoose from "mongoose";
import User from "../../DB/Models/user.model.js";
import { logAdminAction } from "../Admin/adminLog.controller.js";

export const banUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // the model uses isbanned instead of isBanned based on the user model check earlier
    user.isbanned = true;
    await user.save();

    await logAdminAction({
      adminId: req.user.id,
      action: "BAN_USER",
      targetId: id,
      targetType: "USER",
    });

    return res.status(200).json({
      message: "User banned successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isbanned = false;
    await user.save();

    await logAdminAction({
      adminId: req.user.id,
      action: "UNBAN_USER",
      targetId: id,
      targetType: "USER",
    });

    return res.status(200).json({
      message: "User unbanned successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
