import { prisma } from "#lib/prisma.js"
import bcrypt from "bcryptjs"
import {Prisma} from "#generated/client.js"
export const checkCredentials = (async <T extends Prisma.UserSelect> (email: string, password: string, select: T & {id: true}): Promise<Prisma.UserGetPayload<{select: T & {hash: true}}> | false> => {
  const user = await prisma.user.findUnique({
    where:{
      email
    },
    select:{
      hash: true,
      ...select
    }
  })

  if(!user) return false

  const isMatch = await bcrypt.compare(password, user.hash)
  return isMatch ? user : false 

})