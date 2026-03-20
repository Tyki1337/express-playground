import {NextFunction, Request, Response} from "express"
import {prisma} from "#/lib/prisma.js"
import { validateNameSchema as schema } from "#/utils/validationSchema.js"
import { AppError } from "#utils/errorRelated.js"


export const deleteUserByParam = async (req: Request, res: Response, next: NextFunction)=>{
  const {id} = req.params
  const parsedId = Number(id)
  const validatedName = schema.safeParse(id)
  if(!validatedName.success){
    const err = new AppError("Validation error", 400)
    return next(err)
  }
  await prisma.user.delete({
    where:{id: parsedId}
  })
  res.sendStatus(200)

}