import { User as PrismaUser } from "@prisma/client";
import jwt from "jsonwebtoken";

declare global {
  interface RawUser {
    password: string;
    username: string;
    email: string;
    secondName?: string;
  }

  type SafeUser = Pick<PrismaUser, "id" | "email" | "role">;

  interface JwtUser extends SafeUser, jwt.JwtPayload {
    username?: PrismaUser["username"];
  }

  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

export {};