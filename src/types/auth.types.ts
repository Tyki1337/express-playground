import * as z from "zod";

export const UserSchema = z.object({
  username: z.string().min(5).max(10),
  password: z.string().min(5).max(10),
  email: z.email(), 
  secondName: z.string().max(20).optional()
});

export type UserType = z.infer<typeof UserSchema>;

export const LoginZod = UserSchema.pick({ password: true, email: true });
export type LoginType = z.infer<typeof LoginZod>;

export const RegisterZod = UserSchema.pick({ username: true, email: true, password: true });
export type RegisterType = z.infer<typeof RegisterZod>;

export const ChangePasswordZod = z.object({
  current_password: UserSchema.shape.password,
  new_password: UserSchema.shape.password
});

export type ChangePasswordType = z.infer<typeof ChangePasswordZod>;