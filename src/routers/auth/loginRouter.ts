import { Router } from "express"
import { validateBody } from "#middleware/validationMiddleware.js"
import { logIn } from "#controllers/auth/login.Controller.js"
import { LoginZod } from "#/types/auth.types.js"

const router = Router()

router.post("/auth/login", validateBody(LoginZod), logIn)

export default router
