import express from "express"
import router from "./src/routers/barrel.js"
import session from "express-session";
import passport from "passport"
import { PrismaClient } from "@prisma/client/extension";

export const prisma = new PrismaClient()

const app = express();
const PORT = 3000
app.use(express.json())
app.use(session({
  secret: "test",
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 60000 * 60
  }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(router)
app.use((err, res)=>{
console.error(err.stack)
const status = err.status || 500
res.status(status).json({
  success: false,
  message: err.message || "Something went wrong"
})
})


app.listen(PORT)