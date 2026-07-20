import { OrderType } from "#/types/order.types.js"
import {Request, Response} from "express"
import { prisma } from "#lib/prisma.js"
import { validatePromocode } from "#utils/promocode.js"
import client from "#redis/client.js"
import { getRedisKey } from "#services/CartService.js"
import { checkUser } from "#utils/jwt.js"

export const createOrder = async (req: Request<never, never, OrderType>, res: Response) =>{
  checkUser(req.user)
  const {items, promocode, delivery_adress} = req.body
  const userId = req.user.id
  const redisKey = getRedisKey(userId)
  
  const promo = promocode ? await validatePromocode(promocode) : null
  const productIds = items.map(i => i.productId)
  const products = await prisma.product.findMany({
    where: {id: {in: productIds}},
    select:{price: true, id: true}
  })
  const productMap = Object.fromEntries(products.map(i => [i.id, i]))
  const total = items.reduce((sum, i) => sum + productMap[i.productId].price * i.quantity, 0)
  const finalPrice = promo ? Math.round(total * ((100 - promo.discount) / 100 )) : total
  const createdOrder = await prisma.order.create({
    data: {
      userId: userId, 
      total,
      totalFinal: finalPrice,
      address: delivery_adress ?? null,
      promoId: promo?.id ?? null,
      OrderItem: {
        create: items.map(i => ({
          productId: i.productId,
          qty: i.quantity,
          size: i.size ?? null,
          color: i.color ?? null,
          price: productMap[i.productId].price
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
  await client.hDelAll(redisKey)
  res.status(200).json(createdOrder)
}

export const getUserOrders = async (req: Request, res: Response) => {
  checkUser(req.user)
  const orders = await prisma.order.findMany({
    where: {
      id: req.user.id
    },
    include:{
      OrderItem:{
        include:{
          Product:{
            select:{
              title: true, image: true
            }
          }
        }
      }
    },
    orderBy: {createdAt: "desc"}
  })
  return orders ? res.status(200).json(orders) : res.status(404).json({message: "Orders not found"})

}