import { Router } from "express";
import { getCartController, updateProductQtyController } from "#controllers/cart.Controller.js";
import { checkJwt } from "#utils/jwt.js";


const router = Router()
router.use(checkJwt)
router.get("/cart", getCartController)

//router.post("api/cart", validateParams(), validateBody(cartItemSchema.shape.qty), updateProductQtyController)

//router.patch("api/cart:productId", validate)
export default router