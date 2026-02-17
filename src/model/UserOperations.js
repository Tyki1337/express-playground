import bcrypt from "bcryptjs"
import {User} from "./schema.js"

export const createUser = async ({password, ...rest})=> {
const passwordHash = await bcrypt.hash(password, 10)
const user = {...rest, hash: passwordHash}
await User.create(user)
}

export const sendUserData = async(username)=>{
return await User.findOne({username}).select("-hash", "-__v")
}

export const showAllUsers = async()=>{
return await User.find().select({hash: 0, __v: 0}).lean()
}

export const filterUser = async (filter)=>{
  return await User.find({username: filter.name})
}
export const deleteUser = async (username)=>{
  return await User.deleteOne({username})
}