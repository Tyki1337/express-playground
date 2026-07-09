import { UserType } from "#utils/validationSchema.js"
import {Request, Response} from "express"
import { prisma } from "#lib/prisma.js"
export const getInfo = (req: Request, res: Response) => {
  return res.status(200).json(req.user)
}
export const saveSettings = async (req: Request<Record<string, never>, Record<string,never>, Pick<UserType, "username" | "email">>, res: Response) => {
  const {username, email} = req.body
  const updatedUser = await prisma.user.update({
    where:{
      email
    },
    data:{
      email, username
    },
    select:{
      email: true,
      username: true
    }
  })
  
  if(!updatedUser) return res.status(404).json({message: "User not found"})
  
    return res.status(200).json({user:{
    email: updatedUser.email,
    username: updatedUser.username
}})
}