import express, {Response, Request, NextFunction } from "express"
import router from "./src/routers/barrel.js"
import session from "express-session";
import passport from "passport"
import "dotenv"
import cors from "cors"
import { CorsOptions } from "cors";
import { AppError } from "#utils/errorRelated.js";


const app = express();
const PORT = 3000
const whitelist = ['http://localhost:3000']
const corsOptions : CorsOptions = {
  origin: (origin, callback) =>{
    if(!origin || whitelist.includes(origin)){
      callback(null, true)
    }
    else{
      callback(new AppError("CORS blocked request", 403))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', "Authorization"]
  
}
app.use(cors(corsOptions))
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
  console.error(err)
  res.status(status).json({
    status: "error",
    statusCode: status,
    message: message
  })
})


app.listen(PORT, ()=>{
  console.log("Server ready")
})