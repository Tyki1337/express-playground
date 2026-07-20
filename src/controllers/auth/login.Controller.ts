import { AppError } from "#utils/errorRelated.js"
import { Request, Response } from "express"
import { UserType, ChangePasswordType } from "#/types/auth.types.js"
import bcrypt from "bcryptjs"
import { prisma } from "#/lib/prisma.js"
import { checkUser, signJwt } from "#utils/jwt.js"

export const changePassword = async (req: Request<never, never, ChangePasswordType>, res: Response) =>{
  checkUser(req.user)
  const {current_password, new_password} = req.body
  const dbHash  = await prisma.user.findUniqueOrThrow({
    where: {id: req.user.id},
    select:{hash: true}
  })

  const isPasswordCorrect = await bcrypt.compare(current_password, dbHash.hash)
    if(!isPasswordCorrect){
    throw new AppError("Password is not correct", 400)
    }

    await prisma.user.update({
      where: {id: req.user.id},
      data:{
        hash: await bcrypt.hash(new_password, 10)
      }
    })

    return res.status(200).json({"message": "ok"})
  }
  
  export const logIn = async (req: Request<never, never, Pick<UserType, "email" | "password">>, res: Response) =>{
  const {email, password} = req.body
  const result = await prisma.user.findUniqueOrThrow({
    select: {
    hash: true,
    email: true,
    id: true,
    role: true,
    username: true
  },
  where: {
    email
  }
})
const isMatch = await bcrypt.compare(password, result.hash)

if (!isMatch) return res.status(401).json({message: "Invalid credentials"})


const token = signJwt(
  {
    id: result.id,
    email: result.email,
    username: result.username,
    role: result.role
  },
)
return res.status(200).json({token: `Bearer ${token}`,
  user:{
    name: result.username,
    email: result.email,
    role: result.role
  }}
)

}
  export const getInfo = (req: Request, res: Response) => {
  return res.json(req.user)
}

  
