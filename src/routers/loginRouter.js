import { Router } from "express"
import * as loginController from "../controllers/register.Controller.js"

const routerLogin = Router()

routerLogin.get("/api/login", loginController.isAuth, loginController.getInfo)
routerLogin.post("/api/login", loginController.authenticate("local"))

export default routerLogin
