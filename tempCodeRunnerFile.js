import express from "express"
import router from "./src/routers/barrel.js"
import session from "express-session";
import passport from "passport"
import "./src/model/db.js"

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


app.listen(PORT)