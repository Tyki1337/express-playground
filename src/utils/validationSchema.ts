import * as z from "zod"

export const UserSchema = z.object({
  username: z.string().min(5).max(10),
  password: z.string().min(5).max(10),
  email: z.email(),
  secondName: z.string().max(20).optional()
})

export type UserType = z.infer<typeof UserSchema> 

export const ProductQueryZod = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'name', 'popular']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),

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

export type ProductQueryType = z.infer<typeof ProductQueryZod>


export const ChangePasswordZod = z.object({
  current_password: UserSchema.shape.username,
  new_password: UserSchema.shape.username
})

export type ChangePasswordType = z.infer<typeof ChangePasswordZod>

export const CartItemRedisZod = z.object({
  productId: z.int(),
  qty: z.number().int().min(1),
  size: z.string().trim().optional(),
  color: z.string().trim().optional()
})

export type CartItemType = z.infer<typeof CartItemRedisZod>

export const CartZod = z.object({
  items: z.array(CartItemRedisZod)
})

export type CartRedisType = z.infer<typeof CartZod>

export const OrderItemZod = z.object({
  productId: z.int().positive(),
  quantity: z.int().min(1).positive(),
  size: z.string().optional(),
  color: z.string().optional(),
  price: z.int()
})

export type OrderItemType = z.infer<typeof OrderItemZod>

export const OrderZod = z.object({
  items: z.array(OrderItemZod).nonempty("Order must have at least one item"),
  promocode: z.string().optional(),
  delivery_adress: z.string()
})

export type OrderType = z.infer<typeof OrderZod>

export const LoginZod = UserSchema.pick({password: true, email: true})
export type LoginType = z.infer<typeof LoginZod>

export const RegisterZod = UserSchema.pick({
  username: true, email: true, password: true
})

export type RegisterType = z.infer<typeof RegisterZod>

export const ProductQueryResZod = z.object({
    count: z.number().optional(),
    items: z.array(z.object({
    category: z.string(),
    price: z.number(),
    id: z.number(),
    title: z.string().nullable(),
    description: z.string(),
    rating: z.number(),
    image: z.string().nullable()
    }))
  })

export type ProductQueryResType = z.infer<typeof ProductQueryResZod>

