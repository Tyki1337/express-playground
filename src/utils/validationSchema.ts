import * as z from "zod"

export const validationUserSchema = z.object({
  username: z.string().min(5).max(10),
  password: z.string().min(5).max(10),
  email: z.email().optional(),
  secondName: z.string().max(20).optional()
})

export const validationProductQuery = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'name']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
}).refine(data => {
  const hasPage = data.page !== undefined
  const hasLimit = data.limit !== undefined
  return hasLimit === hasPage
},
  { 'message': 'page и limit должны быть указаны вместе' }
).refine(data => {
  return (data.sort && data.sort.length >= 2)
}, 
{
  "message": "Too many sorting arguments"
}
)

export const validateIdSchema = z.coerce.number().int()

export const validationChangePasswordschema = z.object({
  current_password: z.string().min(5).max(10),
  new_password: z.string().min(5).max(10)
})

const cartItemSchema = z.object({
  product_id: z.int(),
  qty: z.number().int().min(1),
  size: z.string().trim().optional(),
  color: z.string().trim().optional()
})

export const CartSchema = z.object({
  items: z.array(cartItemSchema)
})
export const orderItemSchema = z.object({
  product_id: z.int().positive(),
  quantity: z.int().min(1).positive(),
  size: z.string().optional(),
  color: z.string().optional(),
  price: z.int()
})
export const orderSchema = z.object({
  items: z.array(orderItemSchema).nonempty("Order must have at least one item"),
  promocode: z.string().optional(),
  delivery_adress: z.string()
})
export type CartBody = z.infer<typeof CartSchema>
export type CartItem = z.infer<typeof cartItemSchema>