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