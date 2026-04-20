import client from "#/redis/client.js"
import {prisma} from "#/lib/prisma.js"
import { CartItem } from "#/utils/validationSchema.js"

  export const ProcessCart = async (items: CartItem[], userId: number ) =>{
  const productIds = [...new Set(items.map(i => i.product_id))]
  const products = await checkItems(productIds)
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
  const redisKey = `cart:user:${userId}`
  const pipeline = client.multi()
  const cartItems = await client.hGetAll(redisKey)
  const userItems = Object.entries(cartItems).map(([id, data]) => ({
    product_id: id,
    ...JSON.parse(data)
  }))
  items.forEach(i => {
    pipeline.hSet(redisKey, i.product_id, JSON.stringify({
    qty: i.qty,
    size: i.size ?? null,
    color: i.color ?? null
    }))
  })

  pipeline.expire(redisKey, 60 * 60 * 24)
  await pipeline.exec()
  return response
  }
  
  const addToGuestCart = async(sid: number, items: CartItem[])=>{
    const redisKey = `cart:guest:${sid}`
    const oldCartItems = await client.hGetAll(redisKey)
    const productsId = [...new Set(items.map(i => i.product_id))]
    const _ = await checkItems(productsId)
    const map = new Map<string, CartItem>()
    Object.entries(oldCartItems).forEach(([id, data])=>{
      const parsed: Omit<CartItem, 'product_id'> = JSON.parse(data)
      map.set(`${id}-${parsed.size}-${parsed.color}`, JSON.parse(data))
    })
    items.forEach(i =>{
      const key = `${i.product_id}-${i.size}-${i.color}`
      if(map.has(key)){
        const existing = map.get(key)!
        existing.qty += i.qty
      }
      else{
        map.set(key, i)
      }
    })
    const response = Array.from(map.values())
    updateRedis(redisKey, sid, response)
    await ProcessCart(response, sid)
    
  }
  const checkItems = async (ids: number[]) => {
    const existingItems = await prisma.product.findMany({
      where: {id: {in: ids}}})
    if(ids.length !== existingItems.length){
    const foundIds = existingItems.map(i => i.id)
    const missingProducts = ids.filter(i=> !foundIds.includes(i))
    throw new AppError(`Missing products: ${missingProducts.join(", ")}`)
  }
  return existingItems
  }

  const updateRedis = async (redisKey: string, id: string | number, items: any)=>{
    const pipeline = client.multi()
    pipeline.del(redisKey)
    items.forEach(i =>{
      pipeline.hSet(redisKey, `${i.product_id}-${i.size}-${i.color}`, JSON.stringify(i))
    })
    await pipeline.exec()
  }
