import express, {Response, Request, NextFunction } from "express"
import router from "./src/routers/barrel.js"
import session from "express-session";
import passport from "passport"
import "dotenv"


const app = express();
const PORT = 3000
app.use(express.json())
app.use(session({
  secret: process.env.SESSION_SECRET || "backup-key",
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 60000 * 60
  }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(router)

app.use((err: any, req: Request, res: Response, next: NextFunction) =>{
  const status = err.statusCode || 500
  const message = err.message || "Server error"

  res.status(status).json({
    status: "error",
    statusCode: status,
    message: message
  })
})


app.listen(PORT)