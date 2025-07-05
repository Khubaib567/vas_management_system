// MIDDLEWARES FOR PROTECTING ROUTES
const jwt = require('jsonwebtoken');
const db = require("../config/db.config");
const User = db.users;
require('dotenv').config()

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
    console.log(token)
    // DECODED THE JWT TOKEN
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    // console.log(decoded)  
    const userId = decoded.id  
    // console.log(userId)
    const user = await User.findByPk(userId, { include: ["projects"] });
    // // console.log(user.role)
    // CHECK THE USER ROLE
    if (user.role !== process.env.ADMIN) {
        res.status(401)
        return res.send({ message : 'Not allowed!' })
    }
    next()
    }
}


module.exports = {
    auth,
    authRole
}


