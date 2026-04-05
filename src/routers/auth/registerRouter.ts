import { Router } from "express"
import * as register from "#/controllers/auth/register.Controller.js"
import { errorHandler } from "#utils/errorRelated.js"
import { validateBody } from "#middleware/validationMiddleware.js"
import { validationUserSchema } from "#utils/validationSchema.js"

const routerRegister = Router()

routerRegister.get("/api/register", register.isAuth, errorHandler(register.getInfo))
routerRegister.post("/api/register", validateBody(validationUserSchema), errorHandler(register.register))


export default routerRegister
