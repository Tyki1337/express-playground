import {Request, Response, NextFunction} from "express"
import {ParamsDictionary} from "express-serve-static-core"
import { ZodType } from "zod"
import { AppError } from "#utils/errorRelated.js"

export const validateBody = (schema: ZodType ) => (req: Request, res: Response , next: NextFunction)=>{
const result = schema.safeParse(req.body)
if(!result.success){
  return next(new AppError(result.error.message, 400))
}
req.body = result.data
next()
}

export const validateParams = (schema: ZodType ) => (req: Request, res: Response , next: NextFunction)=>{
const result = schema.safeParse(req.params)
if(!result.success){
  return next(new AppError(result.error.message, 400))
}
req.params = result.data as ParamsDictionary
next()
}
