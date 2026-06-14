import AdminLog from "../../DB/Models/adminLog.model.js";

export const logAdminAction = async ({
  adminId,
  action,
  targetId,
  targetType,
  notes,
}) => {
  try {
    const log = await AdminLog.create({
      adminId,
      action,
      targetId,
      targetType,
      notes,
    });
    return log;
  } catch (error) {
    console.error("Error logging admin action:", error);
    return null;
  }
};
