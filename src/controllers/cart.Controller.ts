import { validateBody } from "#middleware/validationMiddleware.js"
import { ProcessCart } from "#services/CartService.js"
import { CartBody, CartSchema } from "#utils/validationSchema.js"
import {Request, Response, NextFunction} from "express"

const syncCart = async (req: Request, res: Response, next: NextFunction) =>{
  validateBody(CartSchema)
  const {items}: CartBody = req.body 
  const response = await ProcessCart(items, req.user!.id)
  const sum = response.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = response.reduce((sum, i)=> sum + i.qty, 0)
  return res.json({items: response, sum, count})
}

const addItem = async (req: Request, res: Response, next: NextFunction) =>{
  if(req.isAuthenticated()) {
    await addToUserCart()
  }
}