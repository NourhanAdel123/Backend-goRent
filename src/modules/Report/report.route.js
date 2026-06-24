import { Router } from "express";
import * as RC from "./report.controller.js";
import {verifyRole} from "../../Middleware/Auth.Middleware.js";

const router = Router();

router.get("/",verifyRole(["admin","superadmin"]),RC.getPlatformReport)

export default router;