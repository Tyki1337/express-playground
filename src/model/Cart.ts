import { prisma } from "#lib/prisma.js"

async function getOrCreateCart(id: number){
  await prisma.cart.upsert({
    where:{userId: id},
    update:{},
    create: {userId: id}
  })
}