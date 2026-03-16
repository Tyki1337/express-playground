import {Request, Response, NextFunction} from "express"
import {deleteUser} from "../model/UserOperations.js"
import { ZodType } from "zod"

export const validateUser = (schema: ZodType ) => (req: Request, res: Response , next: NextFunction)=>{
const result = schema.safeParse(req.body)
if(!result.success)
  res.status(400).json({"message": "error"})
req.body = result.data
next()
}

export const checkRole = (req: Request, next: NextFunction)=>{
  // const {user} = req.body.user
  // if(req.user && (req.user.role === "ADMIN" || req.user.username === user.username))
  //   deleteUser(user.username)
  next()
}