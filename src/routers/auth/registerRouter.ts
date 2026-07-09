import { Router } from "express"
import {register} from "#controllers/auth/register.Controller.js"
import { validateBody } from "#middleware/validationMiddleware.js"
import { RegisterZod } from "#utils/validationSchema.js"

const routerRegister = Router()

routerRegister.post("/api/auth/register", validateBody(RegisterZod), register)


export default routerRegister
