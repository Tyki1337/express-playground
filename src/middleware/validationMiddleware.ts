import {Request, Response, NextFunction} from "express"
import {UserModel as User} from "../generated/models/User.js"
import { AnyZodObject } from "zod/v3"

export const validateUser = (schema: AnyZodObject ) => (req: Request, res: Response, next: NextFunction)=>{
const result = schema.safeParse(req.body)
if(!result.success)
  res.status(400).json({"message": "error"})
req.body = result.data
next()
}

export const checkRole = (role: User["role"], req: Request, res: Response, next: NextFunction)=>{
  const {user} = req
  if(user.role !== role)
    res.sendStatus(403)
  next()
}