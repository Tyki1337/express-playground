const passportLogin = (async (user: Express.User) => {
await new Promise<void>((resolve, reject) =>{
  req.logIn(user, (err: AppError)=> {
    if (err) reject(new AppError("Authentication error", 500))
    resolve()
  })
})
})