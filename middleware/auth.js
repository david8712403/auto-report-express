require('dotenv').config()
const jwt = require('jsonwebtoken')

const authenticationToken = (req, res, next) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403)
        }
        req.auth = payload
        next()
    })
}


module.exports = {
    authenticationToken
}