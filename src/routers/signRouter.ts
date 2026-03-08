import { Router } from "express";
import {validationUserSchema} from "../utils/validationSchema.js"
import {validateUser} from "../middleware/validationMiddleware.js"
import { register } from "../controllers/register.Controller.js";

const router = Router()

router.post("/api/signUp", validateUser(validationUserSchema), register)

export default router