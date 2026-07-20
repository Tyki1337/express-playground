import "#/config/env.js"
import "#/config/globals.ts"
import express, {Response, Request, NextFunction } from "express"
import router from "./src/routers/barrel.js"
import passport from "passport"
import { PrismaAppError } from "#utils/errorRelated.js";
import cookieParser from "cookie-parser"

const app = express();
const PORT = 3000

app.use(express.json())
app.use(cookieParser())

app.use(passport.initialize())

app.use(router)

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) =>{
const error = PrismaAppError.from(err)

const statusCode = error.statusCode || 500
const message = error.message || 'server error'

console.error(error)

  res.status(error.statusCode).json({
    status: "error",
    statusCode,
    message
  })
})


app.listen(PORT, ()=>{
  console.log("Server ready")
})
