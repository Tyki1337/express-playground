import { createUser, sendUserData } from "../model/UserOperations.js"
import "../../passport.js"
import passport from "../../passport.js"

export const register = async (req, res) => {
  const user = req.body
  await createUser(user)
  res.sendStatus(201)
}

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


