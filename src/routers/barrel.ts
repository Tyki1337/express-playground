import {Router} from "express"
//import routerUser from "./userRouter.js"
import routerLogin from "./auth/loginRouter.js"
import routerRegister from "./auth/registerRouter.js"
const router = Router()

//router.use(routerUser)
router.use(routerLogin)
router.use(routerRegister)
export default router