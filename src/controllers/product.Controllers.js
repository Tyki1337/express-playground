import { ECDH } from "crypto"
import { Product } from "../model/schema"

const getProduct = (async(req, res) => {
  let { page = 1, limit = 10, sortBy = "asc", minPrice, maxPrice } = req.query
  page = parseInt(page)
  limit = parseInt(limit)

  const query = {}
  if (minPrice || maxPrice) {
    query.price = {}
    if (minPrice) query.price.$gte = Number(minPrice)
    if (maxPrice) query.price.$lte = Number(maxPrice)
  }
  const [products, allProducts] = await Promise.all([
    Product.find(query)
      .sort(sortBy === "asc" ? { price: 1 } : { price: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(query)

  ])
  return res.json({
    products: products,
    meta: {
      allProducts,

    }
  })
})

export const mergeCart =(isAuth, async(req, res) => {
const {guestCart} = req.body

const guestIds = guestCart.map(item=> item.productId)
const validIds = await Product.distinct("_id", {_id:{$in: guestIds}})

const parsedIds = validIds.map(id => id.toString())

guestCart.array.forEach(guestItem => {
  if(!parsedIds.includes(guestItem.productId.toString())) return

  const existingItem = req.user.cart.find(item => item.productId === guestItem.productId)
  if(existingItem)
    existingItem.quantity += guestItem.quantity
  else{
    req.user.cart.push({
      productId: guestItem.productId,
      quantity: guestItem.quantity
    })
  }
  
});
})

const valuteRate = (async (req,res)=>{
  const {id} = req.body
  const product = await Product.findById({id})
  let exchangeRate = null
  let lastUpdate = 0
  const cacheLifespan = 60 * 60 * 1000

  const getRate = async () => {
    let now = Date.now()
    if(!(exchangeRate && ((now - lastUpdate) <= cacheLifespan))){
      const data = await fetch("https://www.cbr-xml-daily.ru/daily_json.js").json()
      exchangeRate = data.Valute.USD.Valute
      lastUpdate = now
      return exchangeRate
    }
    return exchangeRate
  }

})