import passport from "#/utils/passport.js"
import {prisma} from "#/lib/prisma.js"
import bcrypt from "bcryptjs"
import {NextFunction, Request, Response} from "express"
import { AppError, getErrorMessage } from "#utils/errorRelated.js"

export const register = async (req: Request, res: Response, next: NextFunction) => {
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
  req.logIn(createdUser, (err: AppError)=> {
    if (err) throw new AppError("Authentification error", 500)
  })
  res.status(201).json(createdUser)
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

      if(err) return next(new AppError(err.message, 500))
      if (!user) return next(new AppError("Invalid credentials", 401))
        
      req.logIn(user, (err: AppError) => {
        if (err) return next(new AppError(err.message, 500))
        res.json({ message: "Success", user})
      })
    })(req, res, next)
  }
}

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) return next(new AppError("Not authorized", 403))
  next()
}


