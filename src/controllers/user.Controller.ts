import {Request, Response} from "express"
import {prisma} from "#/lib/prisma.js"
import { validateNameSchema as schema } from "#src/utils/validationSchema.js"


export const deleteUserByParam = async (req: Request, res: Response)=>{
  const {name} = req.params
  const validatedName = schema.safeParse(name)
  if(!validatedName.success){
    throw new Error("Validation error")
  }
  await prisma.user.delete({
    where:{username: validatedName.data}
  })
  res.sendStatus(200)

}