import { UserModel as PrismaUser } from "#/generated/models/User.js"
import { Prisma } from "#generated/browser.ts"
import { Cart, Product } from "#generated/client.js"
import { Optional } from "@prisma/client/runtime/client"
declare global{
  interface RawUser {
    password: string,
    username: string,
    email?: string,
    secondName?: string
  }
  namespace db{
    type User = Prisma.UserGetPayload<{include: {cart: true}}>
  }
  namespace Express{
    type SafeUser = Pick<db.User, "id" | "username" | "role"> & Partial<Pick<db.User, "cart" | "email" | "secondName">>
    interface User extends SafeUser {}
    interface Request{
      user?: User
    }
  }
}
export{}