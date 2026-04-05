import { orderSchema } from "#utils/validationSchema.js"
import {Request, Response} from "express"
import { prisma } from "#lib/prisma.js"
import { validatePromocode } from "#utils/promocode.js"
import { validateBody } from "#middleware/validationMiddleware.js"
import * as z from "zod"
export const createOrder = async (req: Request, res: Response) =>{
validateBody(orderSchema)
  const {items, promocode, delivery_adress} = req.body as z.infer<typeof orderSchema>
  const userId = req.user?.id as number
  
  const promo = promocode ? await validatePromocode(promocode) : null
  const productIds = items.map(i => i.product_id)
  const products = await prisma.product.findMany({
    where: {id: {in: productIds}},
    select:{price: true, id: true}
  })
  const productMap = Object.fromEntries(products.map(i => [i.id, i]))
  const total = items.reduce((sum, i) => sum + productMap[i.product_id].price * i.quantity, 0)
  const finalPrice = promo ? Math.round(total * ((100 - promo.discount) / 100 )) : total
  const createdOrder = prisma.order.create({
    data: {
      userId: userId,
      total,
      totalFinal: finalPrice,
      address: delivery_adress ?? null,
      promoId: promo?.id ?? null,
      OrderItem: {
        create: items.map(i => ({
          productId: i.product_id,
          qty: i.quantity,
          size: i.size ?? null,
          color: i.color ?? null,
          price: productMap[i.product_id].price
      }))
      }
    },
    include: {
      OrderItem: {
        include: {
          Product: {select: {title: true, image: true}}
        }
      }
    }
  })
  res.status(200).json(createdOrder)
}