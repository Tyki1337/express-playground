import * as z from "zod";

export const OrderItemZod = z.object({
  productId: z.int().positive(),
  quantity: z.int().positive(),
  size: z.string().optional(),
  color: z.string().optional(),
  price: z.int()
});

export type OrderItemType = z.infer<typeof OrderItemZod>;

export const OrderZod = z.object({
  items: z.array(OrderItemZod).nonempty("Order must have at least one item"),
  promocode: z.string().optional(),
  delivery_adress: z.string()
});

export type OrderType = z.infer<typeof OrderZod>;