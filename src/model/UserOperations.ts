import bcrypt from "bcryptjs"
import {prisma} from "#/lib/prisma.js"

export const createUser = async (user: RawUser): Promise<Express.SafeUser>=> {
const {password, ...rest} = user
const passwordHash = await bcrypt.hash(password, 10)
const newUser : Express.SafeUser = await prisma.user.create({data: {...rest, hash: passwordHash, cart:{create: {}}}, select:{id: true, username: true, role: true}})
return newUser
}

export const sendUserData = async(username: string)=>{
return await prisma.user.findUnique({
  where:{
    username: username
  },
  select:{
    username: true,
    role: true,
    id: true
  }
})
}

export const showAllUsers = async()=>{
return await prisma.user.findMany()
}


export const deleteUser = async (id: number) : Promise<{"message": string}> =>{
  try{
    const message = {"message": "delete sucessful"}
    await prisma.user.delete({where: {id}})
    return message
  }
catch(err){
   throw new Error("Failed to delete user from db")
  }
} 