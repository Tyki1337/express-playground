import { User as PrismaUser } from "#/generated/client.ts";
import jwt from "jsonwebtoken";

  type SafeUser = Pick<PrismaUser, "id" | "email" | "role">;

  export type JwtUser = SafeUser & jwt.JwtPayload & {
    username?: PrismaUser["username"];
  }


declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

export {};