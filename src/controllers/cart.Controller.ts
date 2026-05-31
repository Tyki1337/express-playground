import { validateBody, validateParams } from "#middleware/validationMiddleware.js"
import { CartBody, CartSchema, CartItem, validateIdSchema } from "#utils/validationSchema.js"
import {Request, Response, NextFunction} from "express"
import client from "#redis/client.js"
import {checkItems, formatCart, getRedisKey, getSumAndCount} from "#services/CartService.js"
import { mergeCart, updateRedis } from "#services/CartService.js"

const getCart = async (req: Request, res: Response, next: NextFunction) =>{
  const redisKey = getRedisKey(req.user?.id, req.session.id)

  const cart = await client.hGetAll(redisKey)
  if(Object.keys(cart).length === 0) {
    return res.status(200).json({items: []})
  }
  const redisIds = Object.values(cart).map((data) => JSON.parse(data).product_Id)

  const dbItems = await checkItems(redisIds)
  const formattedCart = Object.entries(cart).map(([id, data]) => {
    const parsedData: CartItem = JSON.parse(data)
    return {
      product_id: parsedData.product_id,
      qty: parsedData.qty,
      size: parsedData.size || "",
      color: parsedData.color || ""
    }
  })
  const response = await formatCart(formattedCart, dbItems)

  const sum = response.reduce((acc: number, i) => acc + i.price * i.qty, 0)
  const count = response.reduce((acc: number, i)=> acc + i.qty, 0)

  return res.json({items: response, sum, count})
}

const addItem = async (req: Request, res: Response, next: NextFunction) =>{
  validateBody(CartSchema)
  const redisKey = getRedisKey(req.user?.id, req.session.id)
  const {product_Id, qty} = req.body

  const mergedCart = await mergeCart(redisKey, [{product_id: product_Id, qty}])
  await updateRedis(redisKey, mergedCart)
  const dbItems = await checkItems(Object.values(mergedCart).map(i => i.product_id))
  const formattedItems = await formatCart(mergedCart, dbItems)

  const sum = formattedItems.reduce((sum, i) => sum + i.price * qty ,0)
  const count = formattedItems.reduce((sum, i) => sum + i.qty, 0)

  return res.status(200).json({items: formattedItems, sum, count})
}

const patchProduct = async (req: Request, res: Response, next: NextFunction) => {

  validateParams(validateIdSchema)
  let productId : string
  typeof req.params.productId === "string" ? productId = req.params.productId : res.status(400).json({message: "Too many params"})
  const { qty } = req.body
  const redisKey = getRedisKey(req.user?.id, req.session.id)

  const redisCart = await client.hGetAll(redisKey)

  const itemKeys = Object.keys(redisCart).filter(i => i.split("-")[0] === "productId")

  if(!itemKeys.length) return res.status(404).json({message: "Item not found"})
  
  if(qty < 1) await client.hDel(redisKey, itemKeys)
  else {
    itemKeys.forEach(key => {
      const item = JSON.parse(redisCart[key])
      item.qty = qty
      redisCart[key] = JSON.stringify(item)
    })
  }
  await client.hSet(redisKey, Object.fromEntries(
    itemKeys.map(key => [key, redisCart[key]])
  ))

  const updatedCart = client.hGetAll(redisKey)
  const items: CartItem[] = Object.values(updatedCart).map(data => JSON.parse(data))
  const dbItems = await checkItems(items.map(i => i.product_id))
  const formattedCart = await formatCart(items, dbItems)

  const stats = getSumAndCount(formattedCart)
  return res.status(200).json({formattedCart, ...stats})
}

const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  const productId = Number(req.params.productId)
  const redisKey = getRedisKey(req.user?.id, req.session.id)
  const cart = await client.hGetAll(redisKey)
  const keys = Object.keys(cart).filter(k => k.startsWith(`${productId}`))
  await client.hDel(redisKey, keys)

  
}
