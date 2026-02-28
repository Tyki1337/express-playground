import bcrypt from "bcryptjs"
import {User} from "./schema.js"
import {prisma} from "../server.js"

export const createUser = async ({password, ...rest})=> {
const passwordHash = await bcrypt.hash(password, 10)
const user = {...rest, hash: passwordHash}
await User.create(user)
}

export const sendUserData = async(id)=>{
return await prisma.user.findUnique({
  where:{
    id: id
  },
  select:{
    username: true,
    
  }

})
}

export const showAllUsers = async()=>{
return await prisma.user.find()
}

export const filterUser = async (filter)=>{
  return await User.find({username: filter.name})
}
export const deleteUser = async (username)=>{
  return await User.deleteOne({username})
}