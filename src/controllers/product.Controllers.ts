import { validateIdSchema, validationProductQuery } from "#utils/validationSchema.js";
import { validateBody, validateParams } from "#middleware/validationMiddleware.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "#lib/prisma.js";
import { SortOrder } from "#generated/internal/prismaNamespace.js";
import { AppError, getErrorMessage } from "#utils/errorRelated.js";

const productQuery = async (req: Request, res: Response, next: NextFunction)=>{
  try{
  validateBody(validationProductQuery)
  const {page, limit, category, search, sort} = validationProductQuery.parse(req.query)
  const take = limit || 20
  const skip = page ? (page-1)* take : 0
  const orderBy = {price_asc: {price: SortOrder.asc}, price_desc:{price: SortOrder.desc}, name:{name: SortOrder.asc}}[sort ?? "name"]
  const where = {
  ...(search && {title: {contains: search}}),
  ...(category && {category: {category}})
  }

  const [items, count] =  await Promise.all([
  await prisma.product.findMany({
  where, orderBy, take, skip
  }),
  await prisma.product.count({where})
])
  }
  catch(err){
    next(new AppError(getErrorMessage(err), 500))
  }
}

const productById = async (req: Request, res: Response, next: NextFunction)=>{
  try{
  validateParams(validateIdSchema)
  const id = validateIdSchema.parse(req.params)
  res.status(200).json(await prisma.product.findUnique({
    where: {id}
  }))}
  catch(err){
    next(new AppError(getErrorMessage(err), 500))
  }
}