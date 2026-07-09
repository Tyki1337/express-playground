import { getInfo } from "#controllers/auth/me.Controller.js"
import { checkJwt } from "#utils/jwt.js"
import {Router} from "express"
const router = Router()

router.get("/api/auth/me", checkJwt, getInfo)