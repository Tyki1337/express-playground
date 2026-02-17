import { query, param, validationResult } from "express-validator"
import { Router } from "express"
import { User } from "../model/schema.js"
import * as userController from "../controllers/user.Controller.js"
import { isAuth } from "../controllers/register.Controller.js"
const routerUser = Router()


routerUser.get("/api/user/:id", param("id").isInt().trim(), (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.sendStatus(400)
  }
  const parsedId = parseInt(req.params.id)
  const foundUser = arr.find((user) => user.id === parsedId)
  if (!req.session.viewCount) {
    req.session.viewCount = 0
  }
  else req.session.viewCount = req.session.viewCount + 1
  console.log(req.session)
  console.log(req.sessionID)
  return res.send(foundUser)
})

routerUser.get("/api/user", isAuth, async (req, res) => {
  const { user } = req
  const cleanUser = user.toObject()
  return res.json(cleanUser)
})

routerUser.post("/api/user", async (req, res) => {
  const { body } = req
  const newUser = new User(body)
  const savedUser = await newUser.save()
  return res.send(savedUser)
})
routerUser.patch("/api/user/:id", (req, res) => {
  const parsedId = parseInt(req.params.id)
  const indexOfUser = arr.findIndex((user) => user.id === parsedId)
  if (indexOfUser === -1) return res.sendStatus(400)
  arr[indexOfUser] = { ...arr[indexOfUser], ...req.body }
  return res.send(arr)
})
routerUser.delete("/api/user/:name", userController.deleteUserByParam)

export default routerUser
