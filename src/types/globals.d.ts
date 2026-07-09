import { User as PrismaUser } from "#generated/client.js"
import jwt from "jsonwebtoken"
import 'express-session'
declare global{
  interface RawUser {
    password: string,
    username: string,
    email: string,
    secondName?: string
  }
    type SafeUser = Pick<PrismaUser, "id" | "email" | "role">
    interface JwtUser extends SafeUser, jwt.JwtPayload {
      username?: PrismaUser["username"]
    }
    namespace Express{
      interface Request{
        user?: JwtUser
      }
  }
  namespace Cart{
    export type CartRes = {
    sum?: number;
    count?: number;
    items: {
        productId: number;
        qty: number;
        size: "" | null | undefined;
        color: "" | null | undefined;
        price: number;
        rating: number | null
        title: string | null;
    }[] 
  } | Fault.resMessage
  }
  namespace Fault{
    export type resMessage = {
      message: string
    }
  }

}
//   declare module "express-session" {
//   interface SessionData {
//     userId?: string; 
//     user?: SessionUser;
//   }
// }
export{}