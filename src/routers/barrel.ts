import {Router} from "express"
//import routerUser from "./userRouter.js"
import routerLogin from "./auth/loginRouter.js"
import routerRegister from "./auth/registerRouter.js"
import routerMe from "./auth/meRouter.js"
import routerCart from "./cartRoute.js"
const router = Router()

//router.use(routerUser)
router.use("/api", routerLogin)
router.use("/api", routerRegister)
router.use("/api", routerMe)
router.use("/api", routerCart)
export default router