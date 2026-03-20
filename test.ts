import {prisma} from "./src/lib/prisma.js"
console.log("Проверка URL:", process.env.DATABASE_URL);
async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Подключение к базе успешно!");
      const createdUser: any = await prisma.user.create({
    data:{
      username: "testbb",
      hash: "userHash",
    }, 
    select:{id: true, username: true, role: true}})
    console.log(createdUser)
    const users = await prisma.user.findMany()
    console.log(users)
  } catch (e) {
    console.error("❌ Ошибка подключения:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();