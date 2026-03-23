import * as z from "zod"

export const validationUserSchema = z.looseObject({
  username: z.string().min(5).max(10),
  password: z.string().min(5).max(10),
  email: z.email().optional(),
  secondName: z.string().max(20).optional()
})

export const validationProductQuery = z.looseObject({
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

export const validationChangePasswordschema = z.looseObject({
  current_password: z.string().min(5).max(10),
  new_password: z.string().min(5).max(10)
})