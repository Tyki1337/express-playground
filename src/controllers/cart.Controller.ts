import { validateBody, validateParams } from "#middleware/validationMiddleware.js"
import {CartSchema, CartItem, validateIdSchema, CartBody } from "#utils/validationSchema.js"
import {Request, Response, NextFunction} from "express"
import client from "#redis/client.js"
import {mergeCart, getCartStats, getRedisKey, updateRedis } from "#services/CartService.js"

const getCartController = async (req: Request, res: Response<Cart.CartRes>, next: NextFunction) =>{
  const redisKey = getRedisKey(req.user?.id, req.session.id)

  const cart = await client.hGetAll(redisKey)
  if(Object.keys(cart).length === 0) {
    return res.status(200).json({items: []})
  }
  const response = await getCartStats(redisKey)

  return res.json(response)
}

const addItemController = async (req: Request<any, any, CartItem[]>, res: Response<Cart.CartRes>, next: NextFunction) =>{
  validateBody(CartSchema) // to router
  const redisKey = getRedisKey(req.user?.id, req.session.id)
  const item = req.body

  const mergedCart = await mergeCart(redisKey, item)
  await updateRedis(redisKey, mergedCart)
  const response = await getCartStats(redisKey)

  return res.status(200).json(response)
}

const patchProductController = async (req: Request<{productId: string}, any, {qty: number}>, res: Response<Cart.CartRes>, next: NextFunction) => {

  validateParams(validateIdSchema) // to router
  const productId = req.params.productId
  const { qty } = req.body

  const redisKey = getRedisKey(req.user?.id, req.session.id)
  const redisCart = await client.hGetAll(redisKey)

  const itemKeys = Object.keys(redisCart).filter(i => i.split("-")[0] === productId)

  if(!itemKeys.length) return res.status(404).json({message: "Item not found"})
  
  if(qty < 1) await client.hDel(redisKey, itemKeys)
  else {
    const updates: Record<string, string> = {} 
    itemKeys.forEach(key => {
      const item = JSON.parse(redisCart[key])
      item.qty = qty
      updates[key] = JSON.stringify(item)
    })
    await client.hSet(redisKey, updates)
  }
  const response = await getCartStats(redisKey)
  return res.status(200).json(response)
}

const deleteProductController = async (req: Request<{productId: string}, Cart.CartRes>, res: Response<Cart.CartRes>, next: NextFunction) => {
  const productId = Number(req.params.productId)
  const redisKey = getRedisKey(req.user?.id, req.session.id)
  const cart = await client.hGetAll(redisKey)
  const keys = Object.keys(cart).filter(k => k.startsWith(`${productId}`))
  await client.hDel(redisKey, keys)
  const response = await getCartStats(redisKey)
  return res.status(200).json(response)

}

const mergeCartController = async(req: Request<any, any, CartBody>, res: Response<Cart.CartRes>, next: NextFunction) => {
  const redisKey = `cart:user:${req.user!.id}`
  const { items } = req.body
  const mergedCart = await mergeCart(redisKey, items)
  await updateRedis(redisKey, mergedCart)
  const response = await getCartStats(redisKey)
  return res.status(200).json(response)
}
