import { UserModel as PrismaUser } from "#/generated/models/User.js"
import { Prisma } from "#generated/browser.ts"
import { Cart, Product } from "#generated/client.js"
import { Optional } from "@prisma/client/runtime/client"
declare global{
  interface RawUser {
    password: string,
    username: string,
    email: string,
    secondName?: string
  }
  namespace db{
    type User = Prisma.UserGetPayload<{include: {cart: true}}>
  }
  namespace Express{
    type SafeUser = Pick<db.User, "id" | "username" | "email"> & Partial<Pick<db.User, "cart" | "secondName" | "role">>
    type SessionUser = Pick<SafeUser, "id">
    interface User extends SafeUser {}
    interface Request{
      user?: User,
      session: any
    }
  }
  namespace Cart{
    type CartRes = {
    sum?: number;
    count?: number;
    items: {
        product_id: number;
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
    type resMessage = {
      message: string
    }
  }
}
export{}