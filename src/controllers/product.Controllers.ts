import { CartItem, cartItemSchema, validationProductQuery, ValidationProductQueryType } from "#utils/validationSchema.js";
import { validateBody, validateParams } from "#middleware/validationMiddleware.js";
import { Request, Response } from "express";
import { prisma } from "#lib/prisma.js";
import { SortOrder } from "#generated/internal/prismaNamespace.js";
import { Product } from "#generated/client.js";

type ProductQueryResponse = {count: number, items: Product[]}
export const productQuery = async (req: Request<never, never, never, ValidationProductQueryType>, res: Response<ProductQueryResponse>)=>{
  validateBody(validationProductQuery)
  const {page, limit, category, search, sort} = req.query
  const take = limit || 20
  const skip = page ? (page-1)* take : 0
  const orderBy = {price_asc: {price: SortOrder.asc}, price_desc:{price: SortOrder.desc}, name:{name: SortOrder.asc}, popular: {rating: SortOrder.desc}}[sort ?? "name"]
  const where = {
  ...(search && {title: {contains: search}}),
  ...(category && {category})
  }
  
  const [items, count] =  await Promise.all([
  prisma.product.findMany({
  where, orderBy, take, skip
  }),
  prisma.product.count({where})
  ])
  const mappedItems = items.map(i => ({
    productId: i.id,
    category: i.category,
    descripiton: i.description,
    
  }))
  res.status(200).json({items, count})
  }

export const productById = async (req: Request<Pick<CartItem, "productId">, never, never>, res: Response<Product | Fault.resMessage>)=>{
  validateParams(cartItemSchema.shape.productId) // router
  const id = Number(req.query.id)
  const product = await prisma.product.findUnique({
    where: {id}
  })
  
  return product ? res.status(200).json(product) : res.status(404).json({message: "Product not found"})
}

export const findCategories = async (res: Response) => {
  const items = await prisma.product.groupBy({by: ['category'], _count: true })
  res.status(200).json(items)
}