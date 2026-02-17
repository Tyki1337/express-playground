import * as userOperations from "../model/UserOperations"

export const deleteUserByParam = (req,res)=>{
  const {param} = req.body
  deleteUser(param)
  res.sendStatus(200)

}
