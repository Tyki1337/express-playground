import { UserModel as PrismaUser } from "#/generated/models/User.js"
import { Cart, Product } from "#generated/client.js"
import { Optional } from "@prisma/client/runtime/client"
declare global{
  interface RawUser {
    password: string,
    username: string,
    email?: string,
    secondName?: string
  }
  
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