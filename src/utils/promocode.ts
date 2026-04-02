import { prisma } from "#lib/prisma.js"
import { Promo } from "#/generated/client.js"
export async function validatePromocode (code: string): Promise<Promo> {
  const promo = await prisma.promo.findFirst({
    where: {promocode: code,
      OR:
        [{exp: {gt: new Date()}},
         {exp: null} 
        ]      
    }
  })
  if(!promo){
    throw new AppError("Promocode is not valid", 400)
  }
  return promo
}