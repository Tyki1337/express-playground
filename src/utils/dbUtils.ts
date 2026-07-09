import { prisma } from "#lib/prisma.js"
import bcrypt from "bcryptjs"
import {Prisma} from "#generated/client.js"
export const checkCredentials = (async <T extends Prisma.UserSelect> (email: string, password: string, select: T): Promise<Prisma.UserGetPayload<{select: T & {hash: true, id: true}}> | false> => {
  type ExpectedUserPayload = Prisma.UserGetPayload<{ select: T & { hash: true; id: true } }>;
  const user = (await prisma.user.findUnique({
    where:{
      email
    },
    select:{
      hash: true,
      id: true,
      ...select
    } 
  })) 

  if(!user) return false

  const isMatch = await bcrypt.compare(password, user.hash)
  return isMatch ? user : false 

})
export const compareHash = 