import express from "express"
import { verifyRole } from "../../Middleware/Auth.Middleware.js"
import { validateCreateViewing } from "./viewing.validation.js"
import {
    createViewing,
    acceptViewing,
    rejectViewing,
    completeViewing,
    getTenantViewings,
    getOwnerViewings
} from "./viewing.controller.js"

const router = express.Router()


router.post("/", verifyRole(["tenant"]), validateCreateViewing, createViewing)


router.patch("/:id/accept", verifyRole(["owner"]), acceptViewing)
router.patch("/:id/reject", verifyRole(["owner"]), rejectViewing)
router.patch("/:id/complete", verifyRole(["owner"]), completeViewing)


router.get("/tenant", verifyRole(["tenant"]), getTenantViewings)
router.get("/owner", verifyRole(["owner"]), getOwnerViewings)

export default router;