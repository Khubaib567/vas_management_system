const users = require("../controller/user.controller");

export default async function handler(req, res) {
 try {

    const data = await users.updateUserStatusinBulk(req,res)
    console.log(data)
    
 } catch (error) {
   console.error("Error: " + error.message)
 }
}
