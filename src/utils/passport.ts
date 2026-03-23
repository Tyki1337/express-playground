import passport from 'passport';
import { Strategy } from "passport-local"
import { prisma } from "#/lib/prisma.js"
import bcrypt from "bcryptjs"

passport.serializeUser((user: Express.User, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id: number, done) => {
  try {
    const findUser: Express.User | null = await prisma.user.findUnique({
      where: { id }, select: { id: true, username: true, role: true}
    })
    if (!findUser) return done(null, false)
    done(null, findUser)
  }
  catch (err) {
    done(err)
  }
})

passport.use(
  new Strategy({usernameField: 'email'}, async (email, password, done) => {
    try {
      const findUser: Express.DBuser | null = await prisma.user.findUnique(
        { where: { email }, select: { id: true, username: true, hash: true  , role: true } })

      if (!findUser) return done(null, false)

      const isMatch = await bcrypt.compare(password, findUser.hash)
      if (!isMatch) return done(null, false)

      const { hash, ...safeUser } = findUser
      return done(null, safeUser)
    }
    catch (err) {
      done(err)
    }
  }
  )
)

export default passport