import {Request as req, Response as res, NextFunction as next} from "express"
import { UserModel as PrismaUser } from "#/generated/models/User.js"
import { Cart } from "#generated/client.js"
import {AppError} from "#/utils/customError.ts"
declare global{
  interface RawUser {
    password: string,
    username: string,
  } 

  namespace Express{
    type DBuser = Omit<PrismaUser, 'createdAt'> & {cart?: Cart | null}
    type SafeUser = Omit<DBuser, "hash">
    interface User extends SafeUser {}
    interface Request{
      user: SafeUser
    }
  }
}
export{}