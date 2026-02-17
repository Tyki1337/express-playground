import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true
  },
  hash: {
    type: mongoose.Schema.Types.String,
    required: true
  },
  

})
export const User = mongoose.model("User", userSchema)

const productSchema = new mongoose.Schema({
  name:{
    type: mongoose.Schema.Types.String,
    required: true
  },
  price: {
    type: mongoose.Schema.Types.Number,
    required: true,
    min: 0
  },
  productId:{
    type: mongoose.Schema.Types.String,
    required: true
  }

})

export const Product = new mongoose.model("Product", productSchema)





