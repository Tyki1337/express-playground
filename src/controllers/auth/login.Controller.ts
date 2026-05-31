import { AppError, getErrorMessage } from "#utils/errorRelated.js"
import { Request, Response, NextFunction } from "express"
import { validateBody } from "#middleware/validationMiddleware.js"
import { loginSchema, validationChangePasswordschema } from "#utils/validationSchema.js"
import bcrypt from "bcryptjs"
import { prisma } from "#/lib/prisma.js"
import { checkCredentials } from "#utils/dbUtils.js"

const logOut = (req: Request, res: Response, next: NextFunction) => {
  if(!req.user){
    next(new AppError("User is not authenticated", 403))
  }
  req.logOut((err) => {
    if (err) throw new AppError(getErrorMessage(err), 500)
  })
  req.session.destroy((err: Error) =>{
    if (err) return next(new AppError(getErrorMessage(err), 500))
  }
)
res.clearCookie('connect.sid')
res.status(200).json({"message": "ok"})
}

const changePassword = async (req: Request, res: Response, next: NextFunction) =>{
  validateBody(validationChangePasswordschema)
  const {current_password, new_password} = req.body
  if(!req.user){
    throw new AppError("Not authorized", 403)
  }
  const dbHash  = await prisma.user.findUniqueOrThrow({
    where: {id: req.user.id},
    select:{hash: true}
  })

  const isPasswordCorrect = await bcrypt.compare(current_password, dbHash.hash)
    if(!isPasswordCorrect){
    throw new AppError("Password is not correct", 400)
    }

    await prisma.user.update({
      where: {id: req.user.id},
      data:{
        hash: await bcrypt.hash(new_password, 10)
      }
    })

    return res.status(200).json({"message": "ok"})
  }
  
  export const logIn = async (req: Request, res: Response, next: NextFunction) =>{
    validateBody(loginSchema)
    const {email, password} = req.body
  const result = await checkCredentials(email, password, {email: true, username: true, id: true})

    if (!result) return res.status(401).json({message: "Invalid credentials"})

    await new Promise<void>((resolve, reject) =>{
      req.logIn(result, (err: AppError)=> {
        if (err) reject(new AppError("Authentication error", 500))
        resolve()
      })
  })
    return res.status(200).json({user: {
    name: result.username,
    email: result.email
    }})
  }
  
