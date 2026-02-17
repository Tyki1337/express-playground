import { Router } from "express";
import { isAuth } from "../controllers/register.Controller";

const router = Router()

router.get("api/cart", isAuth, (req, res)=>{
  if(!req.user.cart) return res.json({message: "cart is empty"})
  return res.json({cart: req.user.cart})
})
