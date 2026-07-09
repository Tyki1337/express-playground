import client from "#/redis/client.js";
import { prisma } from "#/lib/prisma.js";
import { CartItemType } from "#/utils/validationSchema.js";
import { Product } from "#generated/client.js";
import { AppError } from "#/utils/errorRelated.js";

export interface FormattedCartItem extends CartItemType {
  price: number;
  rating: number;
  title: string | null;
}

export const getRedisKey = (userId: number | string): string => `cart:user:${userId}`;

export const checkItems = async (ids: number[]): Promise<Product[]> => {
  const uniqueIds = [...new Set(ids)];
  if (!uniqueIds.length) return [];

  const existingItems = await prisma.product.findMany({
    where: { id: { in: uniqueIds } }
  });

  if (uniqueIds.length !== existingItems.length) {
    const foundIds = existingItems.map(i => i.id);
    const missingProducts = uniqueIds.filter(id => !foundIds.includes(id));
    throw new AppError(`Missing products: ${missingProducts.join(", ")}`, 404);
  }

  return existingItems;
};

export const updateRedis = async (redisKey: string, items: CartItemType[]): Promise<void> => {
  const pipeline = client.multi();
  pipeline.del(redisKey);
  
  items.forEach(i => {
    pipeline.hSet(redisKey, `${i.productId}-${i.size || 'default'}-${i.color || 'default'}`, JSON.stringify(i));
  });

  pipeline.expire(redisKey, 60 * 60 * 24 * 30)
  await pipeline.exec();
};

const formatCart = (items: CartItemType[], dbItems: Product[]): FormattedCartItem[] => {
  const productMap = Object.fromEntries(dbItems.map(i => [i.id, i]));
  
  return items.map(i => {
    const dbProduct = productMap[i.productId];
    return {
      productId: i.productId,
      qty: i.qty,
      size: i.size,
      color: i.color,
      price: dbProduct ? dbProduct.price : 0,
      rating: dbProduct ? dbProduct.rating : 0,
      title: dbProduct ? dbProduct.title : "Unknown Product"
    };
  });
};

export const mergeCart = async (redisKey: string, items: CartItemType[]): Promise<CartItemType[]> => {
  const oldRedisCart = await client.hGetAll(redisKey);
  const cartMap = new Map<string, CartItemType>();

  Object.entries(oldRedisCart).forEach(([id, data]) => {
    cartMap.set(id, JSON.parse(data) as CartItemType);
  });

  items.forEach(i => {
    const id = `${i.productId}-${i.size || 'default'}-${i.color || 'default'}`;
    const exItem = cartMap.get(id);
    if (exItem) {
      exItem.qty += i.qty;
    } 
    else {
      cartMap.set(id, { ...i });
    }
  });

  return Array.from(cartMap.values());
};

export const getSumAndCount = (cart: FormattedCartItem[]) => {
  const sum = cart.reduce((acc, i) => acc + i.qty * i.price, 0);
  const count = cart.reduce((acc, i) => acc + i.qty, 0);
  return { sum, count };
};

export const getCartSummary = async (redisKey: string): Promise<FormattedCartItem[]> => {
  const redisCart = await client.hGetAll(redisKey);
  const items = Object.values(redisCart).map(data => JSON.parse(data) as CartItemType);
  if (!items.length) return [];

  const dbItems = await checkItems(items.map(i => i.productId));
  return formatCart(items, dbItems);
};

export const getCartStats = async (redisKey: string) => {
  const cart = await getCartSummary(redisKey);
  const stats = getSumAndCount(cart);
  return { items: cart, ...stats };
};