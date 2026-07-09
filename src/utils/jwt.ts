import {config} from "#/config/env.js"
import {Request, Response, NextFunction} from "express"
import jwt, { SignOptions } from "jsonwebtoken"

export const checkJwt = (req: Request, res: Response, next: NextFunction): void=>{
  const authHeader = req.headers.authorization

  if(!authHeader || !authHeader.startsWith("Bearer ")){
    return next(new AppError("Token is missing", 401))
  }
  const token = authHeader.split(" ")[1]
  try{    
    const decoded = jwt.verify(token, config.jwtSecret)
    req.user = decoded as JwtUser
    return next()
  }
  catch(err){
    return next(new AppError("Invalid token", 401))
  }
  
}

export const signJwt = (body: JwtUser, expires: SignOptions["expiresIn"] = "1d") => {
  const token = jwt.sign(body, config.jwtSecret, {expiresIn: expires})
  return token
}