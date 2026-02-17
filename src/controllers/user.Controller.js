import * as userOperations from "../model/UserOperations.js"

export const deleteUserByParam = async (req,res)=>{
  const {name} = req.params
  await userOperations.deleteUser(name)
  res.sendStatus(200)

}