import passport from 'passport';
import {Strategy} from "passport-local"
import {prisma} from "#/lib/prisma.js"
import bcrypt from "bcryptjs"

console.log('Passport keys:', Object.keys(passport || {}))


passport.serializeUser((user : Express.User, done)=>{
  done(null, user.username)
})

passport.deserializeUser(async (username: string, done)=>{
  try{
  const findUser: Express.ReqUser | null = await prisma.user.findUnique({
    where:{username}, select:{id: true, username: true, hash: true, role: true}
  })
  if(!findUser) return done(null, false)
  const {hash, ...safeUser} = findUser
  done(null, safeUser)
  }
  catch(err){
    done(err)
  }
})

passport.use(
  new Strategy(async (username, password, done)=>{
    try{
    const findUser : Express.ReqUser | null = await prisma.user.findUnique(
    {where:{username}, select:{id: true, username: true, hash: true, role: true}})

    if(!findUser) return done(null, false)

    const isMatch = await bcrypt.compare(password, findUser.hash)
    if(!isMatch) return done(null, false)
      
    const {hash, ...safeUser} = findUser
    return done(null, safeUser)
    }
  catch(err){
    done(err)
  }
  }
)
)

export default passport