import { Router } from "express"
import { validateBody } from "#middleware/validationMiddleware.js"
import { logIn } from "#controllers/auth/login.Controller.js"
import { LoginZod } from "#utils/validationSchema.js"

const routerLogin = Router()

routerLogin.post("/api/auth/login", validateBody(LoginZod), logIn)

export default routerLogin
