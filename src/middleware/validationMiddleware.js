export const validateUser = (schema) => (req, res, next)=>{
const result = schema.safeParse(req.body)
if(!result.success)
  res.sendStatus(401)
req.body = result.data
next()
}

export const checkRole = (role, req, res, next)=>{
  const {user} = req.user
  if(user.role !== role)
    res.sendStatus(403)
  next()
}