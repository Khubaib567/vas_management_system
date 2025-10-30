const users = require("../controller/user.controller");

export default async function handler(req, res) {
 try {

    const data = await users.updateUserStatusinBulk(req,res)
    console.log("Cron job: " + data)
    if(data)  res.send({message : "All User's has Subscribed Again!"})
    
 } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Cron job failed" });
 }
}
