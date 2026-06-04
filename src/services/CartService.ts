import client from "#/redis/client.js"
import {prisma} from "#/lib/prisma.js"
import { CartItem } from "#/utils/validationSchema.js"
import { Product } from "#generated/client.js"
  
  export const checkItems = async (ids: number[]) => {
    const uniqueIds = [...new Set(ids)]
    const existingItems = await prisma.product.findMany({
      where: {id: 
        {in: uniqueIds}}})

    if(uniqueIds.length !== existingItems.length){

    const foundIds = existingItems.map(i => i.id)
    const missingProducts = uniqueIds.filter(i=> !foundIds.includes(i))
    throw new AppError(`Missing products: ${missingProducts.join(", ")}`)

  }

  return existingItems
  }

  export const updateRedis = async (redisKey: string, items: CartItem[])=>{
    const pipeline = client.multi()
    pipeline.del(redisKey)
    items.forEach(i =>{
      pipeline.hSet(redisKey, `${i.product_id}-${i.size}-${i.color}`, JSON.stringify(i))
    })
    if(redisKey.split(':')[1] === 'guest') {
      pipeline.expire(redisKey, 60 * 60 * 24)
    }
    else {
      pipeline.expire(redisKey, 60 * 60 * 24 * 30)
    }
    await pipeline.exec()
  }

  const formatCart = async (items: CartItem[], dbItems: Product[])=>{
    const productMap = Object.fromEntries(dbItems.map(i => [i.id, i]))
    return items.map(i =>({
      product_id: i.product_id,
      qty: i.qty,
      size: i.size && null,
      color: i.color && null,
      price: productMap[i.product_id].price,
      rating: productMap[i.product_id].rating,
      title: productMap[i.product_id].title
    }))
  }

  export const mergeCart = async (redisKey: string, items: CartItem[])  => {
    const oldRedisCart = await client.hGetAll(redisKey)
    const cartMap = new Map<string, CartItem>()
    Object.entries(oldRedisCart).forEach(([id, data])=>{
      cartMap.set(id, JSON.parse(data))
    })

    items.forEach(i => {
      const id = `${i.product_id}-${i.size}-${i.color}`
      if(cartMap.has(id)) {
        const exItem = cartMap.get(id)!
        exItem.qty += i.qty
      }
      else{
        cartMap.set(id, i)
      }
    });
    return Array.from(cartMap).map(([id, data]) => data)
      
    }
    export const getRedisKey = (userId?: number, sessionId?: string) => 
      userId ? `cart:user:${userId}` : `cart:guest:${sessionId}`

    export const getSumAndCount = (cart: Awaited<ReturnType<typeof formatCart>>) =>{
      const sum = cart.reduce((sum, i) => sum + i.qty * i.price, 0)
      const count = cart.reduce((sum, i) => sum + i.qty, 0)
      return {sum, count}
    }

    export const getCartSummary = async (redisKey: string) => {
      const redisCart = client.hGetAll(redisKey)

      const items: CartItem[] = Object.values(redisCart).map(data => JSON.parse(data))
      const dbItems = await checkItems(items.map(i => i.product_id))
      const formattedCart = await formatCart(items, dbItems)

      return formattedCart
    }

    export const getCartStats = async (redisKey: string) =>{
      const cart = await getCartSummary(redisKey)
      const stats = getSumAndCount(cart)
      return {items: cart, ...stats}
    }
    
  
