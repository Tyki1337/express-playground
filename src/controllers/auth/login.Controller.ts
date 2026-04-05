import { AppError, getErrorMessage } from "#utils/errorRelated.js"
import { Request, Response, NextFunction } from "express"
import { validateBody } from "#middleware/validationMiddleware.js"
import { validationChangePasswordschema } from "#utils/validationSchema.js"
import bcrypt from "bcryptjs"
import { prisma } from "#/lib/prisma.js"

const logOut = (req: Request, res: Response, next: NextFunction) => {
  if(!req.user){
    next(new AppError("User is not authenticated", 403))
  }
  req.session.destroy((err: Error) =>{
    if (err) return next(new AppError( getErrorMessage(err), 500))
  }
)
res.clearCookie('connect.sid')
res.status(200).json({"message": "ok"})
}

const changePassword = async (req: Request, res: Response, next: NextFunction) =>{
  validateBody(validationChangePasswordschema)
  const {current_password, new_password} = req.body
  if(!req.user){
    throw new AppError("Login first", 403)
  }
  const dbHash  = await prisma.user.findUniqueOrThrow({
    where: {id: req.user.id},
    select:{hash:true}
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
  
