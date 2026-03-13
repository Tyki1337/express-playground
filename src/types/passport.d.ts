import {Request as req, Response as res, NextFunction as next} from "express"
import { UserModel as PrismaUser } from "#/generated/models/User.js"
import { Cart } from "#generated/client.js"
declare global{
  namespace Express{
    type ReqUser = Omit<PrismaUser, 'createdAt'> & {cart?: Cart | null}
    type SafeUser = Omit<ReqUser, "hash">
    interface User extends SafeUser {}
    interface Request{
      user: SafeUser
    }
  }
}
export{}