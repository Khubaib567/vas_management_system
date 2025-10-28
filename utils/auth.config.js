// MIDDLEWARES FOR PROTECTING ROUTES
const jwt = require('jsonwebtoken');
const db_connector = require("../config/db.config");
if(process.env.ENV !== "production"){
  require('dotenv').config({path : '../.secrets/.env'})
}


const auth = () =>  {
    return (req, res, next) => {
        console.log('Access the Private Route!')
        // GET THE TOKEN
        const header = req.headers['authorization']
        const token = header && header.split(' ')[1]

        if (token == null) return res.status(401).send({ message: "Access denied!" });
        // AUTHENTICATED THE USERS
        jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
            if (err) return res.status(403).send({ message: "Not authorized, token failed!" });
            req.user = user
            next()
        })

    }
}

const authRole =  () => {
    return async (req, res, next) => {
    // AUTHORIZED THE USERS BASED ON ROLE
    console.log('Access the Private Route!')
    // GET THE TOKEN
    const header = req.headers['authorization']
    const token = header && header.split(' ')[1]
    // DECODED THE JWT TOKEN
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    // console.log(decoded)  
    const userId = decoded.id
    // console.log(userId)

    let user;
    
    const db = await db_connector();

    if(typeof(db) === "function") {
        const result = await db.query("SELECT * FROM users WHERE id = $1" , [userId])
        user = result[0]
        // console.log('User Role: ' , user)
        // CHECK THE USER ROLE
        if (!user || user.role !== process.env.ADMIN) {
        // console.log("Admin: " , process.env.ADMIN)
        return res.status(401).send({ message : 'Not allowed!' }) 
        }

        next()

    }

    if (typeof(db) === "object")  {
        const User = db.users;
        user = await User.findByPk(userId);
        // CHECK THE USER ROLE
        if (!user || user.role !== process.env.ADMIN) {
        // console.log("Admin: " , process.env.ADMIN)
        return res.status(401).send({ message : 'Not allowed!' }) 
        }

        next()

    }

    if (typeof(db) === "undefined") return res.status(500).send({ message : 'Internal Server Error!' }) 
    
    // if (typeof(db) === "string")  // Find user based user_id from Mongodb!
    }
}


module.exports = {
    auth,
    authRole
}


