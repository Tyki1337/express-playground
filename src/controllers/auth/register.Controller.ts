import {prisma} from "#/lib/prisma.js"
import bcrypt from "bcryptjs"
import {NextFunction, Request, response, Response} from "express"
import { AppError} from "#utils/errorRelated.js"

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const user : RawUser = req.body
  const userHash = await bcrypt.hash(user.password, 10)
  const createdUser = await prisma.user.create({
    data:{
      username: user.username,
      hash: userHash,
      email: user.email
    }, 
    select:{id: true, username: true, role: true, email: true}
  })
  await new Promise<void>((resolve, reject) => {
    req.logIn(createdUser, (err: AppError)=> {
    if (err) reject(new AppError("Authentification error", 500))
    else resolve()
  })
})
  res.status(201).json({
    user: {
      name: createdUser.username,
      email: createdUser.email
    }
  })
  }



export const getInfo = async (req: Request, res: Response, next: NextFunction) => {
  return res.json(req.user)
}


export const isAuth = (req: Request, _: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError("Not authorized", 401))
  next()
}


