import {Router} from "express"
import routerUser from "./userRouter.js"
import routerLogin from "./loginRouter.js"
import routerSign from "./signRouter.js"
const router = Router()

router.use(routerUser)
router.use(routerLogin)
router.use(routerSign)

export default router