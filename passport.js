import passport from "passport"
import {Strategy} from "passport-local"
import {User} from "./src/model/schema.js"
import bcrypt from "bcryptjs"

passport.serializeUser((user, done)=>{
  done(null, user.username)
})

passport.deserializeUser(async (username, done)=>{
  const findUser = await User.findOne({username}).select({hash: 0, __v: 0})
  if(!findUser) return done(null, false)
  done(null, findUser)
})

passport.use(
  new Strategy(async (username, password, done)=>{
    try{
    const findUser = await User.findOne({username})
    if(!findUser) return done(null, false)
    const isMatch = bcrypt.compare(password, findUser.hash)
    if(!isMatch) return done(null, false)  
    return done(null, findUser)
    }
  catch(err){
    done(err)
  }
  }
)
)

export default passport