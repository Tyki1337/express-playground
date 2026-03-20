import {Request, Response, NextFunction} from "express"
import { ZodType } from "zod"
import { AppError } from "#utils/errorRelated.js"

export const validateData = (schema: ZodType ) => (req: Request, res: Response , next: NextFunction)=>{
const result = schema.safeParse(req.body)
if(!result.success){
  return next(new AppError(result.error.message, 400))
}
req.body = result.data
next()
}

export const checkAdminRole = (req: Express.Request, next: NextFunction)=>{
  if(req.user?.role === "ADMIN") return next()
  next(new AppError("Access denied", 403))
}