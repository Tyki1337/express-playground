import * as z from "zod";

export const ProductQueryZod = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'name', 'popular']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).refine(data => {
  const hasPage = data.page !== undefined;
  const hasLimit = data.limit !== undefined;
  return hasLimit === hasPage;
}, { message: 'page и limit должны быть указаны вместе' }
).refine(data => {
  return !data.sort || data.sort.length >= 2;
}, { message: "Too many sorting arguments" });

export type ProductQueryType = z.infer<typeof ProductQueryZod>;

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
});

export type ProductQueryResType = z.infer<typeof ProductQueryResZod>;