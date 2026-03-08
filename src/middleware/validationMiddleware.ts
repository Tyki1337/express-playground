import { NextFunction } from "express"
import { ZodObject } from "zod"

export const validateUser = (schema: ZodObject ) => (req: Request, res: Response, next: NextFunction)=>{
const result = schema.safeParse(req.body)
if(!result.success)
  res.sendStatus(401)
req.body = result.data
next()
}

export const checkRole = (role, req: Request, res: Response, next: NextFunction)=>{
  const {user} = req.user
  if(user.role !== role)
    res.sendStatus(403)
  next()
}