const jwt = require('jsonwebtoken')
require('dotenv').config()

// CONTROLLER FOR GENERATE TOKEN WHEN REGISTER REQUEST
const generateToken = async (res, uuid)=> {
  let token;
  // console.log(userid)
  token = jwt.sign( {id: uuid}, process.env.ACCESS_TOKEN, { expiresIn: 60 * 60});
  await res.cookie('jwt',token, {
    httpOnly:true,
    secure: process.env.NODE !== 'development', // HIDE COOKIES IN PRODUCTION
    sameSite:'strict', // PREVENT ATTACKER TO HACKS USER'S ACTIVITY WHEN USER COME FROM DIFFERENT ORIGIN.
    maxAge: 30*24*60*60*1000 // EXPIRES IN 30 DAYS.
  })

  // console.log(token)
  token = token.replace('jwt=','')
  return token
}

// CONTROLLER FOR REMOVE TOKEN WHEN LOGOUT REQUEST
const removeToken =  async (req,res)=> {
  const header = req.headers.cookie;
  const token = header && header.replace(header,'')
  await res.cookie('jwt', token, {
    httpOnly: true,
    expires: new Date(0),
  });

}
  

 
    

module.exports = {generateToken,removeToken}