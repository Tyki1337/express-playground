import passport from "passport"
import {Strategy} from "passport-local"
import {prisma} from "./server.js"
import bcrypt from "bcryptjs"


passport.serializeUser((user, done)=>{
  done(null, user.username)
})

passport.deserializeUser(async (username, done)=>{
  const findUser = await prisma.user.findUnique({
    where:{username}
  })
  if(!findUser) return done(null, false)
  done(null, findUser)
})

passport.use(
  new Strategy(async (username, password, done)=>{
    try{
    const findUser = await User.findUnique({where:{username}})
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