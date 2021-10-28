require('dotenv').config()
const jwt = require('jsonwebtoken')

const authenticationToken = async (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
    if (err) {
      console.log(err);
      return res.sendStatus(403)
    }
    const { id, account } = payload;
    const [userRelateRows] = await req.db.execute(`SELECT * FROM user_relations WHERE user_id = ${id};`)
    if (userRelateRows.length === 0) {
      res.status(404).json({ error: "No organization found, please contact your manager" })
      return
    }
    payload.organization = userRelateRows[0].organization_id
    payload.role = userRelateRows[0].role
    req.auth = payload
    next()
  })
}


module.exports = {
  authenticationToken
}