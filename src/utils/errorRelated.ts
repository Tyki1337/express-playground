import {NextFunction, RequestHandler, Request, Response} from "express";
export class AppError extends Error{
 public statusCode: number;
 constructor(message = "Server error", statusCode = 500){
  super(message),
  this.name = "AppError"
  this.statusCode = statusCode
  Object.setPrototypeOf(this, AppError.prototype)
 }
}

export const getErrorMessage = (err: unknown): string =>{
  if(err instanceof Error) return err.message
  else return "Unknown error"
}
export const errorHandler = (fn: RequestHandler) =>{
  return (req: Request, res: Response, next: NextFunction)=>{
    Promise.resolve(fn(req,res,next)).catch(next)
  }
}