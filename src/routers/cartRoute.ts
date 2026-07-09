import { Router } from "express";
import { isAuth, validateBody, validateParams } from "#middleware/validationMiddleware.js";
import { getCartController, updateProductQtyController } from "#controllers/cart.Controller.js";
import { cartItemSchema } from "#utils/validationSchema.js";


const router = Router()

router.get("api/cart", isAuth, getCartController)

router.post("api/cart", validateParams(cartItemSchema.shape.productId), validateBody(cartItemSchema.shape.qty), updateProductQtyController)

router.patch("api/cart:productId", validate)
