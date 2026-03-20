import {Request as req, Response as res, NextFunction as next} from "express"
import { UserModel as PrismaUser } from "#/generated/models/User.js"
import { Cart, Product } from "#generated/client.js"
import {AppError} from "#utils/errorRelated.ts"
import { Optional } from "@prisma/client/runtime/client"
declare global{
  interface RawUser {
    password: string,
    username: string,
    email?: string,
    secondName?: string
  }
  interface Product {}

  namespace Express{
    type DBuser = Optional<Omit<PrismaUser, 'createdAt'>, 'secondName' | 'email'> 
    type SafeUser = Omit<DBuser, "hash">
    interface User extends SafeUser {}
    interface Request{
      user?: User
    }
  }
}
export{}