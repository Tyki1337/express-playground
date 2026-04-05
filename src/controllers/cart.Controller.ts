import { prisma } from "#lib/prisma.js"
import { validateBody } from "#middleware/validationMiddleware.js"
import { CartBody, CartSchema } from "#utils/validationSchema.js"
import {Request, Response, NextFunction} from "express"

const syncCart = async (req: Request, res: Response, next: NextFunction) =>{
  validateBody(CartSchema)
  const {items}: CartBody = req.body 

  const productIds = [...new Set(items.map(i => i.product_id))]
  const products = await prisma.product.findMany({
    where:{id: {in: productIds}}
  })
  if(productIds.length !== products.length){
    const foundIds = products.map(i => i.id)
    const missingProducts = productIds.filter(i=> !foundIds.includes(i))
    throw new AppError(`Missing products: ${missingProducts.join(", ")}`)
  }
  const productMap = Object.fromEntries(products.map(i => [i.id, i]))
  const response = items.map(item => ({
    product_id: item.product_id,
    qty: item.qty,
    size: item.size ?? null,
    color: item.color ?? null,
    price: productMap[item.product_id].price,
    rating: productMap[item.product_id].rating,
    title: productMap[item.product_id].title,
  }))
  const sum = response.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = response.reduce((sum, i)=> sum + i.qty, 0)
  return res.json({items: response, sum, count})

}