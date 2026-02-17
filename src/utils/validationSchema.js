import * as z from "zod"

export const validationUserSchema = z.looseObject({
  username: z.string().min(5).max(10),
  password: z.string().min(5).max(10)
})