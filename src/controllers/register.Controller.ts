//import { createUser, sendUserData } from "../model/UserOperations.js"
//import "../../passport.js"
import passport from "../../passport.js"
import {prisma} from "#/lib/prisma.js"
import bcrypt from "bcryptjs"
import {Request, Response} from "express"

export const register = async (req: Request, res: Response) => {
  const user = req.body
  user.hash = bcrypt.hashSync(user.password, 10)
  delete user.password
  await prisma.user.create({
    data:{
      username: user.username,
      hash: user.hash,
      role: "user"

    }
  })
  const {hash, ...safeUser} = user
  res.status(201).json(safeUser)
}
/*
export const getInfo = async (req, res) => {
  if (!req.isAuthenticated()) return res.status(403).json({ message: "not authorised" })
  const userObject = req.user.toObject()
  const { hash, __v, ...rest } = userObject
  return res.json(rest)
}

export const authenticate = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, (err, user) => {
      if (!user || err) return res.json({ message: "jopa" })
      req.logIn(user, (err) => {
        if (err) return res.json({ message: "error" })
        const { hash, __v, ...cleanUser } = user.toObject()
        res.json({ message: "Success", cleanUser })
      })
    })(req, res, next)
  }
}

export const isAuth = (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authorized" })
  next()
}

*/
