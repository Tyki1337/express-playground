import passport from "#utils/passport.js"
import {prisma} from "#/lib/prisma.js"
import bcrypt from "bcryptjs"
import {NextFunction, Request, Response} from "express"
import { AppError } from "#utils/customError.js"

export const register = async (req: Request, res: Response) => {
  try{
      const user : RawUser = req.body
  const userHash = bcrypt.hashSync(user.password, 10)
  const createdUser: Express.SafeUser = await prisma.user.create({
    data:{
      username: user.username,
      hash: userHash,
    }, 
    select:{id: true, username: true, role: true}
  })
  res.status(201).json(createdUser)
  }
  catch(err){
    throw new Error("Server problem")
  }

}

export const getInfo = async (req: Request, res: Response) => {
if(req.user)
  return res.json(req.user)
else 
  return res.json("you're not authenticated")
}

export const authenticate = (strategy: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(strategy, (err: AppError, user: Express.User) => {
      if (!user || err) return next(err)
      req.logIn(user, (err: AppError) => {
        if (err) next(err)
        res.json({ message: "Success", user})
      })
    })(req, res, next)
  }
}

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authorized" })
  next()
}


