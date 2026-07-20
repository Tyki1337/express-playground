import { Router } from "express"
import {register} from "#controllers/auth/register.Controller.js"
import { validateBody } from "#middleware/validationMiddleware.js"
import { RegisterZod } from "#/types/auth.types.js"

const router = Router()

router.post("/auth/register", validateBody(RegisterZod), register)


export default router
