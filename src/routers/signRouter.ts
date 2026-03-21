import { Router } from "express";
import {validationUserSchema} from "#/utils/validationSchema.js"
import {validateBody} from "#/middleware/validationMiddleware.js"
import { register } from "#controllers/auth/register.Controller.js";

const router = Router()

router.post("/api/signUp", validateBody(validationUserSchema), register)

export default router