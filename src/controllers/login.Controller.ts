// import * as userOperations from "../model/UserOperations.js"
import { Request, Response } from "express"

export const deleteUserByParam = (req: Request, res: Response)=>{
  const {param} = req.body
  deleteUser(param)
  res.status(200).end()

}