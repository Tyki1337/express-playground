import "#/config/env.js"
import express, {Response, Request, NextFunction } from "express"
import router from "./src/routers/barrel.js"
import passport from "passport"
import { AppError } from "#utils/errorRelated.js";
import cookieParser from "cookie-parser"

const app = express();
const PORT = 3000

app.use(express.json())
app.use(cookieParser())

app.use(passport.initialize())

app.use(router)

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction): void =>{
let status: number = 500;
let message: string = "Unknown error"
console.log(`[Error Debug] Класс: ${err.constructor.name} | Сообщение: ${err.message}`);
if(err instanceof AppError){  
  status = err.statusCode || 500
  message = err.message || "Server error"
}

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
