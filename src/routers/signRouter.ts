import { Router } from "express";
import {validationUserSchema} from "#/utils/validationSchema.js"
import {validateData} from "#/middleware/validationMiddleware.js"
import { register } from "#controllers/auth/register.Controller.js";

const router = Router()

router.post("/api/signUp", validateData(validationUserSchema), register)

export default router