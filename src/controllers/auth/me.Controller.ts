import {Request, Response, NextFunction} from "express"
const getInfo = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) return res.status(401).json({message: "Not authenticated"})
  return res.status(200).json({user: {
    name: req.user.username,
    email: req.user.email
}})
}