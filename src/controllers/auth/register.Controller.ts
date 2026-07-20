import {prisma} from "#/lib/prisma.js"
import bcrypt from "bcryptjs"
import {Request, Response} from "express"
import { RegisterType } from "#/types/auth.types.js"
import { signJwt } from "#utils/jwt.js"

export const register = async (req: Request<never, never, RegisterType>, res: Response) => {
  const user = req.body
  const userHash = await bcrypt.hash(user.password, 10)
  const createdUser = await prisma.user.create({
    data:{
      username: user.username,
      hash: userHash,
      email: user.email
    }, 
    select:{id: true, username: true, role: true, email: true}
  })
  const token = signJwt(createdUser)
  
  res.status(201).json({
    token: `Bearer ${token}`,
    user: {
      email: createdUser.email,
      name: createdUser.username,
      id: createdUser.id,
      role: createdUser.role
    }
  })}