import { RequestHandler } from "express";
import client from "#redis/client.js";
import { AppError } from "#utils/errorRelated.js";
import { mergeCart, getCartStats, getRedisKey, updateRedis } from "#services/CartService.js";
import { CartItemType, CartRes } from "#/types/cart.types.js";
import { checkUser } from "#utils/jwt.js";

// GET /api/cart
export const getCartController: RequestHandler = async (req, res) => {
  checkUser(req.user)
  const redisKey = getRedisKey(req.user.id);

  const cart = await client.hGetAll(redisKey);
  if (Object.keys(cart).length === 0) {
    return res.status(200).json({ items: [] });
  }

  const response = await getCartStats(redisKey);
  return res.status(200).json(response);
};

// POST /api/cart/add
export const addItemController: RequestHandler<never, CartRes, CartItemType[]> = async (req, res) => {
  checkUser(req.user)
  const redisKey = getRedisKey(req.user.id);
  const items = req.body;

  const mergedCart = await mergeCart(redisKey, items);
  await updateRedis(redisKey, mergedCart);
  
  const response = await getCartStats(redisKey);
  return res.status(200).json(response);
};

// PUT /api/cart/update/:productId
export const updateProductQtyController: RequestHandler<{ productId: string }, CartRes, { qty: number }> = async (req, res, next) => {
  checkUser(req.user)
  const { productId } = req.params;
  const { qty } = req.body;

  const redisKey = getRedisKey(req.user.id);
  const redisCart = await client.hGetAll(redisKey);

  const itemKeys = Object.keys(redisCart).filter(i => i.split("-")[0] === productId);

  if (!itemKeys.length) {
    return next(new AppError("Item not found", 404));
  }
  
  if (qty < 1) {
    await client.hDel(redisKey, itemKeys);
  } else {
    const updates: Record<string, string> = {}; 
    itemKeys.forEach(key => {
      const item = JSON.parse(redisCart[key]) as CartItemType;
      item.qty = qty;
      updates[key] = JSON.stringify(item);
    });
    await client.hSet(redisKey, updates);
  }

  const response = await getCartStats(redisKey);
  return res.status(200).json(response);
};

// DELETE /api/cart/:productId
export const deleteProductController: RequestHandler<{ productId: string }> = async (req, res, next) => {
  checkUser(req.user)
  const productId = Number(req.params.productId);
  const redisKey = getRedisKey(req.user.id);
  
  const cart = await client.hGetAll(redisKey);
  const keys = Object.keys(cart).filter(k => k.startsWith(`${productId}-`));
  
  if (!keys.length) {
    return next(new AppError("Item not found in cart", 404));
  }

  await client.hDel(redisKey, keys);
  
  const response = await getCartStats(redisKey);
  return res.status(200).json(response);
};

// POST /api/cart/merge
export const mergeCartController: RequestHandler<never, CartRes, { items: CartItemType[] }> = async (req, res) => {
  checkUser(req.user)
  const redisKey = getRedisKey(req.user.id);
  const { items } = req.body;

  if (!items || items.length === 0) {
    const response = await getCartStats(redisKey);
    return res.status(200).json(response);
  }

  const mergedCart = await mergeCart(redisKey, items);
  await updateRedis(redisKey, mergedCart);
  
  const response = await getCartStats(redisKey);
  return res.status(200).json(response);
};