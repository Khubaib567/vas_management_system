if(process.env.ENV !== "production"){
  require('dotenv').config({path : '../.secrets/.env'})
}


const jwt = require('jsonwebtoken')


// CONTROLLER FOR GENERATE TOKEN WHEN REGISTER REQUEST
const generateToken = async (res, uuid)=> {
  let token;
  // console.log(userid)
  token = jwt.sign( {id: uuid}, process.env.ACCESS_TOKEN, { expiresIn: 60 * 60 * 24});
  await res.cookie('jwt',token, {
    httpOnly:true,
    secure: process.env.NODE !== 'development', // HIDE COOKIES IN PRODUCTION
    sameSite:'strict', // PREVENT ATTACKER TO HACKS USER'S TOKEN WHEN USER COME FROM DIFFERENT ORIGIN.
    maxAge: 30*24*60*60*1000 // EXPIRES IN 30 DAYS.
  })

  // console.log(token)
  token = token.replace('jwt=','')
  return token
}

const refreshToken = async (uuid) =>{

  // console.log('uuid' , uuid)

  // console.log('accessToken' , process.env.ACCESS_TOKEN)

  let token;
  token =  jwt.sign( {id: uuid}, process.env.ACCESS_TOKEN, { expiresIn: 60 * 60 * 24});

  // console.log(token)
  token = await token.replace('jwt=','')
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
  

 
    

module.exports = {generateToken,removeToken,refreshToken}