import passport from 'passport';
import {Strategy} from "passport-local"
import {prisma} from "#/lib/prisma.js"
import bcrypt from "bcryptjs"

console.log('Passport keys:', Object.keys(passport || {}))


passport.serializeUser((user: any, done: any)=>{
  done(null, user.username)
})

passport.deserializeUser(async (username: string, done: any)=>{
  try{
  const findUser = await prisma.user.findUnique({
    where:{username}
  })
  if(!findUser) return done(null, false)
  done(null, findUser)
  }
  catch(err){
    done(err)
  }
})

passport.use(
  new Strategy(async (username, password, done)=>{
    try{
    const findUser = await prisma.user.findUnique({where:{username}})
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