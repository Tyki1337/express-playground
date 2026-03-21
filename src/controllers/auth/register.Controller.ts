import passport from "#/utils/passport.js"
import {prisma} from "#/lib/prisma.js"
import bcrypt from "bcryptjs"
import {NextFunction, Request, Response} from "express"
import { AppError, getErrorMessage } from "#utils/errorRelated.js"

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try{
  const user : RawUser = req.body
  const userHash = bcrypt.hashSync(user.password, 10)
  const createdUser: Express.SafeUser = await prisma.user.create({
    data:{
      username: user.username,
      hash: userHash,
      email: user.email
    }, 
    select:{id: true, username: true, role: true, email: true}
  })
  res.status(201).json(createdUser)
  }
  catch(err){
    next(new AppError(getErrorMessage(err), 500))
  }

}

export const getInfo = async (req: Request, res: Response, next: NextFunction) => {
if(req.user)
  return res.json(req.user)
else 
  return next(new AppError("Not authorized", 401))
}

export const authenticate = (strategy: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(strategy, (err: AppError, user: Express.User) => {
      if (!user || err) return next(new AppError(err.message, 400))
      req.logIn(user, (err: AppError) => {
        if (err) return next(new AppError(err.message, 500))
        res.json({ message: "Success", user})
      })
    })(req, res, next)
  }
}

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authorized" })
  next()
}


