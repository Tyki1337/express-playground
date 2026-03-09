import {Request, Response} from "express"
import { UserModel as PrismaUser } from "#/generated/models/User.js"
declare global{
  namespace Express{
    interface Request{}
    interface Response{}
    interface User extends PrismaUser{}
  }
}
export{}