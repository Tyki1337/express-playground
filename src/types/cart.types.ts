import * as z from "zod";

export const CartItemRedisZod = z.object({
  productId: z.number().int().positive(),
  qty: z.number().int().min(1),
  size: z.string().trim().nullable().optional(),
  color: z.string().trim().nullable().optional()
});

export type CartItemType = z.infer<typeof CartItemRedisZod>;

export const CartZod = z.object({
  items: z.array(CartItemRedisZod)
});

export type CartRedisType = z.infer<typeof CartZod>;

export interface FormattedCartItem extends Required<Omit<CartItemType, "size" | "color">> {
  size: string | null
  color: string | null
  price: number;
  rating: number;
  title: string | null;
}

export interface ResMessage {
  message: string;
}

export type CartRes = {
  sum?: number;
  count?: number;
  items: FormattedCartItem[];
} | ResMessage;